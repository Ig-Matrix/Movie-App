const moviePage = document.querySelector("main");
const cardContainer = document.querySelector(".card");
const searchInput = document.querySelector('input[type="search"'),
    searchBtn = document.querySelector(".searchButton"),
    searchResult = document.querySelector(".searchResult");
const apiUrl = "https://api.tvmaze.com/shows";

searchBtn.addEventListener("click", async () => {
    const searchTerm = searchInput.value.toLowerCase();
    const fetchedShows = await fetchShowsData();

    const matchingTerms = fetchedShows.filter((show) => {
        show.name.toLowerCase().includes(searchTerm);
    });

    if (matchingTerms.length === 0) {
        const result = elementCreator("p", "No results");
        searchResult.appendChild(result);
    } else {
        matchingTerms.forEach((show) => {
            const cardColumn = displayShow(show, show.rating.average);
            searchResult.appendChild(cardColumn);
        });
    }
});

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
    nextLi = elementClasslist("li", "nextLi"),
    prevLi = elementClasslist("li", "prevLi"),
    prev = elementCreator("button", "Prev");

paginationContainer.classList.add("pagination");
nextLi.classList.add("page-item");
next.classList.add("page-link");
prev.classList.add("page-link");
prevLi.classList.add("page-item");

nextLi.appendChild(next)
prevLi.appendChild(prev)
paginationContainer.append(prevLi, nextLi);
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

        let cardColumn = displayShow(show, show.rating.average);

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
        ? (prevLi.style.visibility = "hidden")
        : (prevLi.style.visibility = "visible");

    let totalPages = Math.ceil(totalMovies.length / itemsPerpage);

    currentPage === totalPages
        ? (nextLi.style.visibility = "hidden")
        : (nextLi.style.visibility = "visible");
}

function displayShow(tvShow, ratingAve) {
    let card = document.createElement("div"),
        cardImg = document.createElement("img"),
        cardBody = document.createElement("div"),
        likes = document.createElement("span"),
        likesNum = document.createElement("span"),
        numComments = document.createElement("span"),
        commentsIcon = document.createElement("span"),
        cardTitle = document.createElement("h3");

    let ratingsEl = elementClasslist("div", "ratingsEl");
    let likesCommentsCont = elementClasslist("div", "likes-comm-cont");
    cardImg.src = tvShow.image.original;
    cardTitle.textContent = tvShow.name;

    card.classList.add("container-fluid", "card");
    card.style.width = "18rem";
    cardImg.classList.add("card-img-top");
    likes.classList.add("fas", "fa-heart");
    commentsIcon.classList.add("fas", "fa-message");
    cardBody.classList.add("card-body");
    cardTitle.classList.add("card-title");

    let modal = createModalPage(tvShow);
    let username = modal.querySelector(".username");
    let userComments = modal.querySelector(".userComments");
    let errorMes = modal.querySelector(".error");
    let submitCommentBtn = modal.querySelector(".submit-btn");
    let displayCommentsElement = modal.querySelector(".display-comments");
    let commentsNumber = modal.querySelector(".commentsNum");
    errorMes.textContent = "name and comment cannot be empty";

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
            res.ok ? getcomments(id) : console.log("Error posting comment");
        } catch (error) {
            console.error(error);
        }
    }
    function showComments(apiData) {
        displayCommentsElement.innerHTML = "";

        if (apiData) {
            const timeNow = new Date();
            for (let i = apiData.length - 1; i >= 0; i--) {
                const data = apiData[i];
                const timeOfComment = new Date(data.creation_date);
                const timeDiffInMillSec = timeNow - timeOfComment;
                const timeInDays = Math.floor(
                    timeDiffInMillSec / (1000 * 60 * 60 * 24)
                );
                let timeDiff = "";
                if (timeInDays === 0) {
                    timeDiff = "today";
                } else if (timeInDays === 1) {
                    timeDiff = "yesterday";
                } else {
                    timeDiff = `${timeInDays} days ago`;
                }

                let commentElement = elementClasslist("div", "comment");
                const nameEL = elementContentAndClasslist(
                        "span",
                        data.username,
                        "name"
                    ),
                    commentEl = elementContentAndClasslist(
                        "span",
                        data.comment,
                        "comment"
                    ),
                    timeEl = elementContentAndClasslist(
                        "span",
                        timeDiff,
                        "time"
                    );

                commentElement.append(nameEL, commentEl, timeEl);
                displayCommentsElement.appendChild(commentElement);
            }
            if (apiData.length === undefined) {
                commentsNumber.innerText = `(${0})`;
                numComments.innerText = 0;
            } else {
                commentsNumber.innerText = `(${apiData.length})`;
                numComments.innerText = apiData.length;
            }
            if (numComments.innerText > 0) {
                commentsIcon.style.color = "#160404";
            }
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

    getcomments(tvShow.id);

    async function sendLikes(id) {
        const url = `https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/ENb4nAMyQ3alRHSK9fPd/likes`;
        const dataBody = {
            item_id: id,
        };
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataBody),
            });
            if (res.ok) {
                console.log("like sent successfully");
                getLikes();
            }
        } catch (error) {
            console.log(error);
        }
    }

    getLikes();

    async function getLikes() {
        const url = `https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/ENb4nAMyQ3alRHSK9fPd/likes`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            showLikes(data);
        } catch (error) {
            console.log(error);
        }
    }

    function showLikes(likesData) {
        likesData.filter((like) => {
            if (like.item_id === tvShow.id) {
                likesNum.innerText = like.likes;
            }
        });
    }

    likes.addEventListener(
        "click",
        function (e) {
            sendLikes(tvShow.id);
            getLikes();
            e.target.style.color = "red";
        },
        { once: true }
    );

    cardImg.addEventListener("click", () => {
        modal.style.display = "block";
        getcomments(tvShow.id);
    });
    commentsIcon.addEventListener("click", () => {
        modal.style.display = "block";
        getcomments(tvShow.id);
    });

    submitCommentBtn.addEventListener("click", () => {
        if (username.value !== "" && userComments.value !== "") {
            sendComments(tvShow.id, username.value, userComments.value);
            username.value = "";
            userComments.value = "";
        } else {
            errorMes.style.visibility = "visible";
        }

        setTimeout(() => {
            errorMes.style.visibility = "hidden";
        }, 2000);
    });

    function calcRatings(ratings) {
        let average = (ratings / 10) * 5;
        return average;
    }

    function displayRatings() {
        let rating = calcRatings(ratingAve);
        if (rating === 1) {
            ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `;
        } else if (rating > 1 && rating < 2) {
            ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star-half-stroke" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            `;
        } else if (rating === 2) {
            ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `;
        } else if (rating > 2 && rating < 3) {
            ratingsEl.innerHTML = `
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star-half-stroke" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `;
        } else if (rating === 3) {
            ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            `;
        } else if (rating > 3 && rating < 4) {
            ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star-half-stroke" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `;
        } else if (rating === 4) {
            ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `;
        } else if (rating > 4 && rating < 5) {
            ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star-half-stroke" style="color: #ffd700;"></i>
            `;
        } else if (rating === 5) {
            ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            `;
        }
    }

    displayRatings();

    likesCommentsCont.append(likes, likesNum, commentsIcon, numComments);
    cardBody.append(cardTitle, ratingsEl, likesCommentsCont);
    card.append(cardImg, cardBody, modal);

    return card;
}

populateShow();

function createModalPage(tvShow) {
    let modalPage = document.createElement("div"),
        modalContent = document.createElement("div"),
        closePageIcon = document.createElement("span"),
        showImage = document.createElement("img"),
        commentContainer = document.createElement("div"),
        inputName = document.createElement("input"),
        inputComment = document.createElement("textarea"),
        errorMessage = document.createElement("div");

    const showTitle = elementContentAndClasslist(
        "h2",
        tvShow.name,
        "showTitle"
    );
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
        addComment = elementContentAndClasslist(
            "h5",
            "Add Comment",
            "addcomment"
        );
    (commentSectionTitle = elementContentAndClasslist(
        "h5",
        "All Comments",
        "commentSectionTitle"
    )),
        (nameLabel = elementContentAndClasslist("label", "Name", "form-label")),
        (messageLabel = elementContentAndClasslist(
            "label",
            "Message",
            "form-label"
        )),
        (submitComment = elementContentAndClasslist(
            "button",
            "Submit",
            "submit-btn"
        ));
    const modalInner = elementClasslist("div", "modalInner");
    const middleBody = elementClasslist("div", "middleBody");
    middleBody.innerHTML = `
    <p class=''>${tvShow.network.name} (${tvShow.premiered}-${tvShow.ended})</p>
    <p class=''><span class="fw-bold">Schedule:</span> ${tvShow.schedule.days[0]}s at ${tvShow.schedule.time} (${tvShow.averageRuntime}mins)</p>
    <p class=''><span class="fw-bold">Status:</span> ${tvShow.status}</p>
    <p class=''><span class="fw-bold">Show-type:</span> ${tvShow.type}</p>
    <p class=''><span class="fw-bold">Genres:</span> ${tvShow.genres[0]}, ${tvShow.genres[1]}, ${tvShow.genres[2]}</p>
    <p class=''><span class="fw-bold">Language:</span> ${tvShow.language}</p>
    <p class=''><span class="fw-bold">Download size:</span> ${tvShow.weight}mb</p>
    <p class=''><span class="fw-bold">Official site:</span> Visit <a href="${tvShow.officialSite}"class="text-decoration-none fst-italic">${tvShow.network.name}</a> </p>
    `;

    closePageIcon.textContent = "X";

    closePageIcon.addEventListener("click", () => {
        modalPage.style.display = "none";
    });

    showDescription.innerHTML = tvShow.summary;
    showImage.src = tvShow.image.medium;

    modalPage.classList.add("modal");
    closePageIcon.classList.add("close");
    showImage.classList.add("modalImage");
    modalContent.classList.add("modal-content");
    inputName.classList.add("form-control", "username");
    inputComment.classList.add("form-control", "userComments");
    errorMessage.classList.add("error");

    inputName.placeholder = "Enter name ";
    inputComment.placeholder = "Enter comment ";

    commentNameWrapper.append(nameLabel, inputName);
    commentMessageWrapper.append(messageLabel, inputComment);
    commentContainer.append(
        errorMessage,
        addComment,
        commentNameWrapper,
        commentMessageWrapper,
        submitComment
    );

    movieSection.appendChild(showImage);
    descSection.appendChild(showDescription);
    leftSection.append(showTitle, movieSection, descSection);

    middleSection.append(middleTitle, middleBody);
    commentsHeading.append(commentSectionTitle, commentsNum);
    displayComments.append(commentsHeading, displayCommentsBody);

    rightSection.append(commentContainer, displayComments);

    modalInner.append(leftSection, middleSection, rightSection);
    modalContent.append(modalInner, closePageIcon);

    modalPage.append(modalContent);

    window.addEventListener("click", (e) => {
        if (e.target === modalPage) {
            modalPage.style.display = "none";
        }
    });

    return modalPage;
}
