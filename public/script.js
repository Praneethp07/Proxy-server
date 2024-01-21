const inputField = document.getElementById("inputUrl");
const enterbtn = document.getElementById("Enter_url");

function validateUrl(str) {
  return String(str).includes('.');
}
enterbtn.addEventListener('click', () => {
    const url = window.location.href;
    const inputValue = inputField.value;
    if (inputValue.trim() !== '') {
         if(!url.includes(`?url=${inputValue}`)) {
            if(validateUrl(inputValue)){
                window.location.href += `?url=${inputValue}`;
                // window.location.href +=`?url=google.com/search?q=${inputValue}`;
            }
            else{
                //use default google engine
                window.location.href +=`?url=google.com/search?q=${inputValue}`
            }
        }
    }
});

