function addActive(linkId,scrollTo) {
    document.querySelectorAll("#sidebar ul li a").forEach((link) => {
        link.classList.remove("active");
    });

    const link = document.getElementById(linkId);
    if (link) {
        link.classList.add("active");
    }

    const targetElement = document.querySelector(`#${scrollTo}`);
    targetElement.scrollIntoView({
        behavior: 'smooth'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll("#sidebar ul li a").forEach((link) => {
        link.addEventListener("click", function () {
            document.querySelectorAll("#sidebar ul li a").forEach((l) => {
                l.classList.remove("active");
            });

            this.classList.add("active");
        });
    });

});
function sendMail(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const company = document.getElementById('company').value;
    const message = document.getElementById('message').value;

    const subject = encodeURIComponent("Contact Form Submission");
    const body = encodeURIComponent(
        `Name: ${name}\nCompany: ${company}\nMessage: ${message}`
    );

    const mailtoLink = `mailto:notsolvablehat@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
}

const resumeDiv = document.getElementById('resume-div');
const resumeIcon = document.getElementById('resume');

resumeDiv.addEventListener('mouseenter', () => {
    resumeIcon.setAttribute('trigger', 'in');
});

const elements = [
    { id: 'myname', navId: 'home-a' },
    { id: 'aa', navId: 'skills-a' },
    { id: 'p2', navId: 'projects-a' },
    { id: 'online-content', navId: 'about-a' },
    { id: 'header', navId: 'contact-a' }
];

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Get the nav element corresponding to the observed element
        const navElement = elements.find(el => el.id === entry.target.id)?.navId;

        if (entry.isIntersecting && navElement) {
            // Add 'active' to the current section's nav link
            document.getElementById(navElement).classList.add("active");
        } else if (navElement) {
            // Remove 'active' if the section is not in view
            document.getElementById(navElement).classList.remove("active");
        }
    });
}, {
    threshold: 1
});

// Observe all elements
elements.forEach(el => {
    const element = document.getElementById(el.id);
    if (element) observer.observe(element);
});

function getResume(){
    const notification = document.getElementById('notification');
    notification.style.display = 'block';

    const downloadLink = document.getElementById('download-link');
    downloadLink.click();

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
