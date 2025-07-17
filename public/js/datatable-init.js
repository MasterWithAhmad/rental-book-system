// Initialize DataTables for all tables with .datatable class
$(document).ready(function() {
  $('.datatable').DataTable({
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50, 100],
    ordering: true,
    searching: true,
    responsive: true,
    language: {
      search: 'Filter:',
      lengthMenu: 'Show _MENU_ entries',
      info: 'Showing _START_ to _END_ of _TOTAL_ entries',
      paginate: {
        previous: 'Prev',
        next: 'Next'
      }
    }
  });
});
