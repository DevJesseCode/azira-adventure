(function () {
    let eruda_script = document.createElement("script");
    eruda_script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/eruda/3.0.1/eruda.min.js";
    eruda_script.setAttribute(
        "integrity",
        "sha512-KkkY/3auRhaXDFzFMpwtZ+BrS8EBQ+GfiBxdJ9jGMi6Gg74/sYbq/IZpY593pkNjTmbeRfBwjpZo+7gcpH45Ww==",
    );
    eruda_script.setAttribute("crossorigin", "anonymous");
    eruda_script.setAttribute("referrerpolicy", "no-referrer");
    eruda_script.addEventListener("load", () => eruda.init());
    eruda_script.addEventListener("error", () => {
        eruda_script.remove();
        eruda_script = document.createElement("script");
        eruda_script.src = "./js/eruda.min.js";
        eruda_script.onload = () => eruda.init();
        eruda_script.onerror = () => console.warn("The eruda console script failed to load.");
        document.body.appendChild(eruda_script);
    });
    document.body.appendChild(eruda_script);
})();