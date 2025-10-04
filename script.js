document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for sidebar links
    document.querySelectorAll('#sidebar a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for active link highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('#sidebar a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-50% 0px -50% 0px', // Trigger in the middle of the viewport
        threshold: 0
    });

    sections.forEach(section => {
        observer.observe(section);
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

function getResume() {
    const notification = document.getElementById('notification');
    const notificationN = document.getElementById('notificationN');

    if (window.navigator.onLine) {
        notification.style.display = 'block';
        document.getElementById('download-link').click();
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    } else {
        notificationN.style.display = 'block';
        setTimeout(() => {
            notificationN.style.display = 'none';
        }, 3000);
    }
}