// Component logic
let username = '';
let password = '';

const handleInputChange = (event) => {
  if (event.target.id === 'username') {
    username = event.target.value;
  } else if (event.target.id === 'password') {
    password = event.target.value;
  }
};

const handleSubmit = () => {
  console.log('Username:', username);
  console.log('Password:', password);
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('username').addEventListener('input', handleInputChange);
  document.getElementById('password').addEventListener('input', handleInputChange);
  document.getElementById('login-button').addEventListener('click', handleSubmit);
});document.addEventListener('DOMContentLoaded', () => {
  console.log('App ready');
});
