document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        [...document.getElementsByClassName("block-wrapper")].forEach((e) => {
            e.style.removeProperty("transform");
            e.style.removeProperty("transform-style");
        });

        setTimeout(() => {
            [...document.getElementsByClassName("block-wrapper")].forEach((e) => {
                e.style.removeProperty("transform");
                e.style.removeProperty("transform-style");
            });
        }, 1000);
    }, 3500);
});
