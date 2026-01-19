from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render, redirect
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.template.loader import render_to_string

from .models import FreedomPost, PostLike, Comment
from .forms import FreedomPostForm, WallCommentForm, ReportForm




# =========================
# MAIN FREEDOM WALL (FEED)
# =========================
@login_required
def freedom_wall(request):
    # Create post
    if request.method == "POST":
        post_form = FreedomPostForm(request.POST)
        if post_form.is_valid():
            post = post_form.save(commit=False)
            post.user = request.user
            post.save()
            return redirect("wall:freedom_wall")
    else:
        post_form = FreedomPostForm()

    posts_qs = (
        FreedomPost.objects
        .select_related("user")
        .prefetch_related("likes")
        .order_by("-created_at")
    )

    paginator = Paginator(posts_qs, 5)
    page_obj = paginator.get_page(request.GET.get("page"))

    return render(
        request,
        "wall/freedom_wall.html",
        {
            "post_form": post_form,
            "page_obj": page_obj,
        },
    )

# =========================
# POST DETAIL
# =========================
@login_required
def post_detail(request, post_id):
    post = get_object_or_404(FreedomPost, id=post_id)

    comments = (
        Comment.objects
        .filter(post=post, parent__isnull=True)
        .select_related("user")
        .order_by("-created_at")
    )

    return render(
        request,
        "wall/post_detail.html",
        {
            "post": post,
            "comments": comments,
            "comment_form": WallCommentForm(),
        },
    )

# =========================
# ADD COMMENT
# =========================
@login_required
def add_comment(request, post_id):
    post = get_object_or_404(FreedomPost, id=post_id)

    if request.method == "POST":
        form = WallCommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user
            comment.post = post
            comment.save()

    return redirect("wall:post_detail", post_id=post.id)

# =========================
# REPLY TO COMMENT
# =========================
@login_required
def reply_comment(request, post_id, comment_id):
    post = get_object_or_404(FreedomPost, id=post_id)
    parent_comment = get_object_or_404(Comment, id=comment_id)

    if request.method == "POST":
        form = WallCommentForm(request.POST)
        if form.is_valid():
            reply = form.save(commit=False)
            reply.user = request.user
            reply.post = post
            reply.parent = parent_comment
            reply.save()

    return redirect("wall:post_detail", post_id=post.id)


@login_required
def comment_replies_modal(request, comment_id):
    comment = get_object_or_404(
        Comment.objects.select_related("user", "post"),
        id=comment_id
    )

    replies = (
        Comment.objects
        .filter(parent=comment)
        .select_related("user")
        .order_by("created_at")
    )

    html = render_to_string(
        "wall/partials/replies_modal_body.html",
        {
            "comment": comment,
            "replies": replies,
            "post": comment.post,
        },
        request=request
    )

    return JsonResponse({"html": html})

# =========================
# REPORT COMMENT
# =========================
@login_required
def report_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)

    if request.method == "POST":
        form = ReportForm(request.POST)
        if form.is_valid():
            report = form.save(commit=False)
            report.comment = comment
            report.reported_by = request.user
            report.save()

    return redirect("wall:freedom_wall")

# =========================
# TOGGLE LIKE (REACTION)
# =========================
@login_required
def toggle_like(request, post_id):
    post = get_object_or_404(FreedomPost, id=post_id)

    like, created = PostLike.objects.get_or_create(
        user=request.user,
        post=post
    )

    if not created:
        like.delete()

    return JsonResponse({
        "liked": created,
        "count": post.likes.count(),
    })


@login_required
def comment_thread(request, comment_id):
    parent_comment = get_object_or_404(
        Comment.objects.select_related("user", "post"),
        id=comment_id,
        parent__isnull=True
    )

    replies = (
        Comment.objects
        .filter(parent=parent_comment)
        .select_related("user")
        .order_by("created_at")
    )

    return render(
        request,
        "wall/comment_thread.html",
        {
            "comment": parent_comment,
            "replies": replies,
            "post": parent_comment.post,
            "comment_form": WallCommentForm(),
        },
    )