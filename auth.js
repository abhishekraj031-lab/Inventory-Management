// Stockhouse demo auth gate.
// This is a static, mocked-data prototype: there's no real backend or session,
// just a localStorage flag set when the login/signup form is submitted.
(function () {
  try {
    if (localStorage.getItem('stockhouseAuthed') !== '1') {
      window.location.replace('login.html');
    }
  } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('sbLogoutBtn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    try { localStorage.removeItem('stockhouseAuthed'); } catch (e) {}
    window.location.href = 'login.html';
  });
});
