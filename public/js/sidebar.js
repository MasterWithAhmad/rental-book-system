const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarWrapper = document.getElementById('sidebar-wrapper');
const wrapper = document.getElementById('wrapper');

// Restore state on load
if (sidebarWrapper && wrapper && localStorage.getItem('sidebar-collapsed') === 'true') {
    sidebarWrapper.classList.add('collapsed');
    wrapper.classList.add('sidebar-collapsed');
}

if (sidebarToggle && sidebarWrapper && wrapper) {
    sidebarToggle.addEventListener('click', function () {
        sidebarWrapper.classList.toggle('collapsed');
        wrapper.classList.toggle('sidebar-collapsed');
        // Save state
        localStorage.setItem('sidebar-collapsed', sidebarWrapper.classList.contains('collapsed'));
    });
}
