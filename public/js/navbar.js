function navResponsive() {
    scroll(0,0)
    const x = document.querySelector(".navbar");
    if (x.className === "navbar") x.className += " responsive";
    else x.className = "navbar";
  }
  