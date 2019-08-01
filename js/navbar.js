/* Navbar */

function toggleNavBar() {
    $("nav").slideToggle();
}

function toggleSection(elem) {
    var content = elem.parentElement.nextElementSibling;
    $(content).slideToggle(500);
}

