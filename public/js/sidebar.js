const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarWrapper = document.getElementById('sidebar-wrapper');
const wrapper = document.getElementById('wrapper');

// Restore state on load
if (sidebarWrapper && wrapper) {
    const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    sidebarWrapper.classList.toggle('collapsed', collapsed);
    wrapper.classList.toggle('sidebar-collapsed', collapsed);
}

if (sidebarToggle && sidebarWrapper && wrapper) {
    sidebarToggle.addEventListener('click', function () {
        const isCollapsed = !sidebarWrapper.classList.contains('collapsed');
        sidebarWrapper.classList.toggle('collapsed', isCollapsed);
        wrapper.classList.toggle('sidebar-collapsed', isCollapsed);
        // Save state
        localStorage.setItem('sidebar-collapsed', isCollapsed);
    });
}
