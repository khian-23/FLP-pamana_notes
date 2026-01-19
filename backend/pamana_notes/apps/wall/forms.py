from django import forms
from .models import FreedomPost, Comment
from apps.notes.models import CommentReport

class FreedomPostForm(forms.ModelForm):
    content = forms.CharField(
        widget=forms.Textarea(
            attrs={
                "rows": 4,
                "placeholder": "Share something…",
                "class": "w-full border rounded p-3",
            }
        )
    )

    class Meta:
        model = FreedomPost
        fields = ["content"]
        

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["content"]
        widgets = {
            "content": forms.Textarea(attrs={
                "rows": 2,
                "placeholder": "Write a comment..."
            }),
        }

class ReportForm(forms.ModelForm):
    class Meta:
        model = CommentReport
        fields = ['reason']
        widgets = {
            'reason': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Reason for reporting...'}),
        }
    

class WallCommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["content"]