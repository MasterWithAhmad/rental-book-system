// Handles opening add/edit forms in a modal and submitting via AJAX for all entities
$(document).ready(function() {
  // Enhance DataTables toolbar grouping for professional look
  $('.datatable').each(function() {
    var table = $(this).DataTable();
    var wrapper = $(this).closest('.dataTables_wrapper');
    var length = wrapper.find('.dataTables_length');
    var filter = wrapper.find('.dataTables_filter');
    var exportBtn = wrapper.find('.dt-export-btn, .export-btn, .btn-outline-success').closest('div');
    if (!wrapper.find('.dt-toolbar').length) {
      var toolbar = $('<div class="dt-toolbar"></div>');
      toolbar.append(length).append(filter).append(exportBtn);
      wrapper.prepend(toolbar);
    }
  });
  // --- Members ---
  $(document).on('click', '#addMemberBtn', function(e) {
    e.preventDefault();
    $('#mainModalLabel').text('Add Member');
    $('#mainModal .modal-body').html('<div class="text-center text-secondary py-5">Loading form...</div>');
    $('#mainModal').modal('show');
    $.get('/members/add', function(data) {
      $('#mainModal .modal-body').html($(data).find('form'));
    });
  });
  $(document).on('click', '.edit-member-btn', function(e) {
    e.preventDefault();
    var url = $(this).attr('href');
    $('#mainModalLabel').text('Edit Member');
    $('#mainModal .modal-body').html('<div class="text-center text-secondary py-5">Loading form...</div>');
    $('#mainModal').modal('show');
    $.get(url, function(data) {
      $('#mainModal .modal-body').html($(data).find('form'));
    });
  });

  // --- Books ---
  $(document).on('click', '#addBookBtn', function(e) {
    e.preventDefault();
    $('#mainModalLabel').text('Add Book');
    $('#mainModal .modal-body').html('<div class="text-center text-secondary py-5">Loading form...</div>');
    $('#mainModal').modal('show');
    $.get('/books/add', function(data) {
      $('#mainModal .modal-body').html($(data).find('form'));
    });
  });
  $(document).on('click', '.edit-book-btn', function(e) {
    e.preventDefault();
    var url = $(this).attr('href');
    $('#mainModalLabel').text('Edit Book');
    $('#mainModal .modal-body').html('<div class="text-center text-secondary py-5">Loading form...</div>');
    $('#mainModal').modal('show');
    $.get(url, function(data) {
      $('#mainModal .modal-body').html($(data).find('form'));
    });
  });

  // --- Rentals (Issue/Edit) ---
  $(document).on('click', '#issueBookBtn', function(e) {
    e.preventDefault();
    $('#mainModalLabel').text('Issue Book');
    $('#mainModal .modal-body').html('<div class="text-center text-secondary py-5">Loading form...</div>');
    $('#mainModal').modal('show');
    $.get('/rentals/issue', function(data) {
      $('#mainModal .modal-body').html($(data).find('form'));
    });
  });
  $(document).on('click', '.edit-rental-btn', function(e) {
    e.preventDefault();
    var id = $(this).data('rental-id');
    $('#mainModalLabel').text('Return Book');
    $('#mainModal .modal-body').html('<div class="text-center text-secondary py-5">Loading form...</div>');
    $('#mainModal').modal('show');
    $.get('/rentals/return/' + id, function(data) {
      $('#mainModal .modal-body').html($(data).find('form'));
    });
  });

  // --- Staff ---
  $(document).on('click', '#addStaffBtn', function(e) {
    e.preventDefault();
    $('#mainModalLabel').text('Add Staff');
    $('#mainModal .modal-body').html('<div class="text-center text-secondary py-5">Loading form...</div>');
    $('#mainModal').modal('show');
    $.get('/staff/add', function(data) {
      $('#mainModal .modal-body').html($(data).find('form'));
    });
  });
  $(document).on('click', '.edit-staff-btn', function(e) {
    e.preventDefault();
    var url = $(this).attr('href');
    $('#mainModalLabel').text('Edit Staff');
    $('#mainModal .modal-body').html('<div class="text-center text-secondary py-5">Loading form...</div>');
    $('#mainModal').modal('show');
    $.get(url, function(data) {
      $('#mainModal .modal-body').html($(data).find('form'));
    });
  });

  // --- Universal AJAX form submit for modal ---
  $(document).on('submit', '#mainModal form', function(e) {
    e.preventDefault();
    var $form = $(this);
    var url = $form.attr('action');
    var method = $form.attr('method') || 'POST';
    var data = $form.serialize();
    $.ajax({
      url: url,
      method: method,
      data: data,
      success: function(res) {
        $('#mainModal').modal('hide');
        Swal.fire({ icon: 'success', title: 'Success', text: 'Saved successfully!' });
        setTimeout(function() { location.reload(); }, 1000);
      },
      error: function(xhr) {
        Swal.fire({ icon: 'error', title: 'Error', text: xhr.responseText || 'Failed to save.' });
      }
    });
  });
});
