const inputField = document.getElementById("inputUrl");
const enterbtn = document.getElementById("Enter_url");

enterbtn.addEventListener('click', () => {
    const url = window.location.href;
    const inputValue = inputField.value;

    if (inputValue.trim() !== '') {
        if (!url.includes(`?url=${inputValue}`)) {
            window.location.href += `?url=${inputValue}`;
        }
    }
});

