// Component logic

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  console.log('Username:', username);
  console.log('Password:', password);
});document.addEventListener('DOMContentLoaded', () => {
  console.log('App ready');
});
