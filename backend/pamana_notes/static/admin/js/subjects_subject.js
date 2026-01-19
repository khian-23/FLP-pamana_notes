document.addEventListener("DOMContentLoaded", function () {
    const isMajor = document.getElementById("id_is_major");
    const isGeneral = document.getElementById("id_is_general");
    const courseField = document.querySelector(".field-course");

    function toggleCourse() {
        if (isMajor.checked) {
            courseField.style.display = "block";
            isGeneral.checked = false;
        } else {
            courseField.style.display = "none";
        }
    }

    function toggleGeneral() {
        if (isGeneral.checked) {
            courseField.style.display = "none";
            isMajor.checked = false;
        }
    }

    toggleCourse();
    toggleGeneral();

    isMajor.addEventListener("change", toggleCourse);
    isGeneral.addEventListener("change", toggleGeneral);
});
