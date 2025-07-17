// SweetAlert2 delete confirmation for all major delete actions
$(document).ready(function() {
  // Members
  $('.delete-member-form').on('submit', function(e) {
    e.preventDefault();
    const form = this;
    Swal.fire({
      title: 'Are you sure?',
      text: 'This member will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        form.submit();
      }
    });
  });

  // Books
  $('.delete-book-form').on('submit', function(e) {
    e.preventDefault();
    const form = this;
    Swal.fire({
      title: 'Are you sure?',
      text: 'This book will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        form.submit();
      }
    });
  });

  // Rentals
  $('.delete-rental-form').on('submit', function(e) {
    e.preventDefault();
    const form = this;
    Swal.fire({
      title: 'Are you sure?',
      text: 'This rental record will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        form.submit();
      }
    });
  });

  // Staff
  $('.delete-staff-form').on('submit', function(e) {
    e.preventDefault();
    const form = this;
    Swal.fire({
      title: 'Are you sure?',
      text: 'This staff member will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        form.submit();
      }
    });
  });
});
