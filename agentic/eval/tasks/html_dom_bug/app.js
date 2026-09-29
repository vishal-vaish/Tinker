// App entrypoint
function init() {
    // BUG: index.html defines button with id="submit-btn", but here it looks for "submit-button"
    const submitBtn = document.getElementById("submit-button");
    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            const output = document.getElementById("output");
            if (output) output.textContent = "Submitted successfully!";
        });
    }
}

document.addEventListener("DOMContentLoaded", init);
