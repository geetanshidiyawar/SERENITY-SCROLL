const pageData = {
    title: document.title,
    url: window.location.href,
    text: document.body.innerText.slice(0, 5000)
};

console.log("SERENITY PAGE DATA:");
console.log(pageData);