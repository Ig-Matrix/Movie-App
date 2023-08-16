const moviePage = document.querySelector("main");
const cardContainer = document.querySelector(".card");
const apiUrl = "https://api.tvmaze.com/shows";

const elementCreator = (elementName, content) => {
    const element = document.createElement(elementName);
    element.textContent = content;
    return element;
};

const paginationContainer = elementCreator("ul"),
    next = elementCreator("button", "Next"),
    prev = elementCreator("button", "Prev");

paginationContainer.classList.add("pagination");
next.classList.add("page-item");
prev.classList.add("page-item");

paginationContainer.append(prev, next);
moviePage.append(paginationContainer);

let itemsPerpage = 8;
let currentPage = 1;

async function fetchShowsData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching shows data:", error);
    }
}

async function populateShow() {
    let showsData = await fetchShowsData();

    cardContainer.innerHTML = "";

    let startIndex = (currentPage - 1) * itemsPerpage,
        endIndex = startIndex + itemsPerpage;

    let row;

    let moviesToShow = showsData.slice(startIndex, endIndex);

    moviesToShow.forEach((show, index) => {
        if (index % 4 === 0) {
            row = document.createElement("div");
            row.classList.add("row", "mb-4");
            cardContainer.appendChild(row);
        }

        let cardColumn = displayShow(show);

        row.appendChild(cardColumn);
    });

    hideBtns(showsData);
}

next.addEventListener("click", () => {
    currentPage++;
    populateShow();
});

prev.addEventListener("click", () => {
    currentPage--;
    populateShow();
});

function hideBtns(totalMovies) {
    currentPage === 1
        ? (prev.style.visibility = "hidden")
        : (prev.style.visibility = "visible");

    let totalPages = Math.ceil(totalMovies.length / itemsPerpage);

    currentPage === totalPages
        ? (next.style.visibility = "hidden")
        : (next.style.visibility = "visible");
}

function displayShow(tvShow) {
    let card = document.createElement("div"),
        cardImg = document.createElement("img"),
        cardBody = document.createElement("div"),
        likes = document.createElement("span"),
        comments = document.createElement("span"),
        cardTitle = document.createElement("h3");

    cardImg.src = tvShow.image.original;
    cardTitle.textContent = tvShow.name;

    card.classList.add("container-fluid", "card");
    card.style.width = "18rem";
    cardImg.classList.add("card-img-top");
    likes.classList.add("fas", "fa-heart");
    comments.classList.add("fas", "fa-comment");
    cardBody.classList.add("card-body");
    cardTitle.classList.add("card-title", "text-center");

    let modal = createModalPage(tvShow);

    comments.addEventListener("click", () => {
        modal.style.display = "block";
    });

    cardBody.append(cardTitle, likes, comments);
    card.append(cardImg, cardBody, modal);

    return card;
}

populateShow();

function createModalPage(tvShow) {
    let modalPage = document.createElement("div"),
        modalContent = document.createElement("div"),
        closePageIcon = document.createElement("span"),
        showDescription = document.createElement("p"),
        showImage = document.createElement("img"),
        showTitle = document.createElement("h2"),
        commentContainer = document.createElement("div"),
        commentNameWrapper = document.createElement("div"),
        commentMessageWrapper = document.createElement("div"),
        inputName = document.createElement("input"),
        inputComment = document.createElement("textarea"),
        submitComment = document.createElement("button");

    closePageIcon.textContent = "X";

    closePageIcon.addEventListener("click", () => {
        modalPage.style.display = "none";
    });

    submitComment.textContent = "Submit";
    submitComment.type = "submit";

    showDescription.innerHTML = tvShow.summary;
    showImage.src = tvShow.image.medium;
    showTitle.textContent = tvShow.name;

    modalPage.classList.add("modal");
    closePageIcon.classList.add("close");
    showImage.classList.add("modalImage");
    modalContent.classList.add("modal-content");

    submitComment.textContent = "Submit";
    inputName.placeholder = "Enter name ...";
    inputComment.placeholder = "Enter comment ...";

    commentNameWrapper.appendChild(inputName)
    commentMessageWrapper.appendChild(inputComment)
    commentContainer.append(commentNameWrapper, commentMessageWrapper, submitComment)

    modalContent.append(
        showImage,
        showTitle,
        showDescription,
        commentContainer,
        closePageIcon
    );
    

    modalPage.append(modalContent);

    window.addEventListener("click", (e) => {
        if (e.target === modalPage) {
            modalPage.style.display = "none";
        }
    });

    return modalPage;
}

