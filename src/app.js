const moviePage = document.querySelector("main");
const cardContainer = document.querySelector(".card");
const apiUrl = "https://api.tvmaze.com/shows";

const elementCreator = (elementName, content) => {
    const element = document.createElement(elementName);
    element.textContent = content;
    return element;
};

const elementClasslist = (elementName, className) => {
    const element = document.createElement(elementName);
    element.classList.add(className);
    return element;
};

const elementContentAndClasslist = (elementName, content, className) => {
    const element = elementCreator(elementName, content);
    element.classList.add(className);
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
        commentsIcon = document.createElement("span"),
        cardTitle = document.createElement("h3");

    cardImg.src = tvShow.image.original;
    cardTitle.textContent = tvShow.name;

    card.classList.add("container-fluid", "card");
    card.style.width = "18rem";
    cardImg.classList.add("card-img-top");
    likes.classList.add("fas", "fa-heart");
    commentsIcon.classList.add("fas", "fa-comment");
    cardBody.classList.add("card-body");
    cardTitle.classList.add("card-title", "text-center");

    let modal = createModalPage(tvShow);

    let username = modal.querySelector(".username");
    let userComments = modal.querySelector(".userComments");
    let errorMes = modal.querySelector(".error");
    let submitCommentBtn = modal.querySelector(".submit-btn");
    let displayCommentsElement = modal.querySelector(".display-comments");
    let commentsNumber = modal.querySelector(".commentsNum");
    errorMes.textContent = "name and comment cannot be empty";
    
    function showComments(apiData) {
        displayCommentsElement.innerHTML=""
        if (apiData) {
            apiData.forEach((data) => {
                let commentElement = elementClasslist("div", "comment");
                commentElement.innerHTML = `<span class="name">${data.username}</span>:${data.comment}<span class="time">${data.creation_date}</span>`;
                displayCommentsElement.append(commentElement);
            });
            commentsNumber.innerText=`(${apiData.length})` 
        }
    }
    

    async function getcomments(id) {
        const url = `https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/ENb4nAMyQ3alRHSK9fPd/comments?item_id=${id}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            showComments(data);
        } catch (error) {
            console.error(error);
        }
    }

    commentsIcon.addEventListener("click", () => {
        modal.style.display = "block";
        getcomments(tvShow.id)
    });

    submitCommentBtn.addEventListener("click", () => {
        if (username.value !== "" && userComments.value !== "") {
            sendComments(tvShow.id, username.value, userComments.value);
            getcomments(tvShow.id);
        } else {
            errorMes.style.visibility = "visible";
        }

        setTimeout(() => {
            errorMes.style.visibility = "hidden";
        }, 2000);
    });

    cardBody.append(cardTitle, likes, commentsIcon);
    card.append(cardImg, cardBody, modal);

    return card;
}

populateShow();

function createModalPage(tvShow) {
    let modalPage = document.createElement("div"),
        modalContent = document.createElement("div"),
        closePageIcon = document.createElement("span"),
        showImage = document.createElement("img"),
        showTitle = document.createElement("h2"),
        commentContainer = document.createElement("div"),
        inputName = document.createElement("input"),
        inputComment = document.createElement("textarea"),
        errorMessage = document.createElement("div");

    const leftSection = elementClasslist("div", "leftSection"),
        middleSection = elementClasslist("div", "middleSection"),
        rightSection = elementClasslist("div", "rightSection"),
        movieSection = elementClasslist("div", "movieSection"),
        descSection = elementClasslist("div", "descSection"),
        showDescription = elementClasslist("p", "modal-text-desc");
    (displayComments = elementClasslist("div", "displayComments")),
    (commentsHeading = elementClasslist("div", "commentsHeading")),
        (displayCommentsBody = elementClasslist("div", "display-comments")),
        (commentNameWrapper = elementClasslist("div", "nameWrapper")),
        (commentMessageWrapper = elementClasslist("div", "messageWrapper")),
        (commentsNum = elementClasslist("span", "commentsNum"));

    const middleTitle = elementContentAndClasslist(
            "h2",
            "TV SHOW INFO",
            "middleTitle"
        ),
        commentSectionTitle = elementContentAndClasslist(
            "h5",
            "All Comments",
            "commentSectionTitle"
        ),
        nameLabel = elementContentAndClasslist("label", "Name", "form-label"),
        messageLabel = elementContentAndClasslist(
            "label",
            "Message",
            "form-label"
        ),
        submitComment = elementContentAndClasslist(
            "button",
            "Submit",
            "submit-btn"
        );
    const middleBody = elementClasslist("div", "middleBody");

    closePageIcon.textContent = "X";

    closePageIcon.addEventListener("click", () => {
        modalPage.style.display = "none";
    });

    showDescription.innerHTML = tvShow.summary;
    showImage.src = tvShow.image.medium;
    showTitle.textContent = tvShow.name;

    modalPage.classList.add("modal");
    closePageIcon.classList.add("close");
    showImage.classList.add("modalImage");
    modalContent.classList.add("modal-content");
    inputName.classList.add("form-control", "username");
    inputComment.classList.add("form-control", "userComments");
    errorMessage.classList.add("error");

    inputName.placeholder = "Enter name ...";
    inputComment.placeholder = "Enter comment ...";

    commentNameWrapper.append(nameLabel, inputName);
    commentMessageWrapper.append(messageLabel, inputComment);
    commentContainer.append(
        errorMessage,
        commentNameWrapper,
        commentMessageWrapper,
        submitComment
    );

    movieSection.appendChild(showImage);
    descSection.appendChild(showDescription);
    leftSection.append(showTitle, movieSection, descSection);

    middleSection.appendChild(middleTitle, middleBody);
    commentsHeading.append(commentSectionTitle, commentsNum)
    displayComments.append(commentsHeading, displayCommentsBody);

    rightSection.append(commentContainer, displayComments);

    modalContent.append(
        leftSection,
        middleSection,
        rightSection,
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

async function sendComments(id, username, comment) {
    const apiUrl = `https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/ENb4nAMyQ3alRHSK9fPd/comments`;
    const commentsData = {
        item_id: id,
        username: username,
        comment: comment,
    };
    try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(commentsData),
        });
        res.ok
            ? console.log("comment posted succesfuuly")
            : console.log("Error posting comment");
    } catch (error) {
        console.error(error);
    }
}
