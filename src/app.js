const moviePage = document.querySelector('main')
const cardContainer = document.querySelector('.card')
const searchInput = document.querySelector('input[type="search"')
const searchBtn = document.querySelector('.searchButton')
const searchResult = document.querySelector('.searchResult')
const apiUrl = 'https://api.tvmaze.com/shows'

const elementCreator = (elementName, content) => {
  const element = document.createElement(elementName)
  element.textContent = content
  return element
}

const elementClasslist = (elementName, className) => {
  const element = document.createElement(elementName)
  element.classList.add(className)
  return element
}

const elementContentAndClasslist = (elementName, content, className) => {
  const element = elementCreator(elementName, content)
  element.classList.add(className)
  return element
}

const paginationContainer = elementCreator('ul')
const next = elementCreator('button', 'Next')
const nextLi = elementClasslist('li', 'nextLi')
const prevLi = elementClasslist('li', 'prevLi')
const prev = elementCreator('button', 'Prev')

paginationContainer.classList.add('pagination')
nextLi.classList.add('page-item')
next.classList.add('page-link')
prev.classList.add('page-link')
prevLi.classList.add('page-item')

nextLi.appendChild(next)
prevLi.appendChild(prev)
paginationContainer.append(prevLi, nextLi)
moviePage.append(paginationContainer)

const itemsPerpage = 8
let currentPage = 1

async function fetchShowsData () {
  try {
    const response = await fetch(apiUrl)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching shows data:', error)
  }
}

async function populateShow () {
  const showsData = await fetchShowsData()

  cardContainer.innerHTML = ''

  const startIndex = (currentPage - 1) * itemsPerpage
  const endIndex = startIndex + itemsPerpage

  let row

  const moviesToShow = showsData.slice(startIndex, endIndex)

  moviesToShow.forEach((show, index) => {
    if (index % 4 === 0) {
      row = document.createElement('div')
      row.classList.add('row', 'mb-4')
      cardContainer.appendChild(row)
    }

    const cardColumn = displayShow(show, show.rating.average)

    row.appendChild(cardColumn)
  })

  // add event listener to the search button
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const searchValue = searchInput.value.trim().toLowerCase()

    displaySearchResults(searchValue)
  })

  // add event listener to the search input so it displays results based on each key entered
  searchInput.addEventListener('keyup', () => {
    const searchValue = searchInput.value.trim().toLowerCase()

    displaySearchResults(searchValue)
  })

  function displaySearchResults (searchValue) {
    // clears container anytime search occurs so it will display results based on searching
    cardContainer.innerHTML = ''

    // creates an array of names that where the searched name matches a a show name inside the entire fetched movie list
    const searchResults = showsData.filter((show) =>
      show.name.toLowerCase().includes(searchValue)
    )

    if (searchResults.length === 0) {
      // if the array is empty, i.e no matching terms is found
      const notFoundMessage = elementContentAndClasslist(
        'p',
        'No results found.',
        'text-center'
      )
      notFoundMessage.classList.add('not-found-message')
      cardContainer.appendChild(notFoundMessage)
    } else {
      searchResults.forEach((show) => {
        // call the display show function to create cards based on shows inside the matching terms array
        const cardColumn = displayShow(show, show.rating.average)
        cardContainer.appendChild(cardColumn) // append to the cardcontainer
      })
    }

    paginationContainer.style.display = 'none' // removes pagination since we want only searched items
  }

  hideBtns(showsData) // executes hide button function with feched api data
}

populateShow()

next.addEventListener('click', () => {
  currentPage++
  populateShow()
})

prev.addEventListener('click', () => {
  currentPage--
  populateShow()
})

// hide pages
function hideBtns (totalMovies) {
  currentPage === 1
    ? (prevLi.style.visibility = 'hidden')
    : (prevLi.style.visibility = 'visible')

  const totalPages = Math.ceil(totalMovies.length / itemsPerpage)

  currentPage === totalPages
    ? (nextLi.style.visibility = 'hidden')
    : (nextLi.style.visibility = 'visible')
}

function displayShow (tvShow, ratingAve) {
  const card = document.createElement('div')
  const cardImg = document.createElement('img')
  const cardBody = document.createElement('div')
  const likes = document.createElement('span')
  const likesNum = document.createElement('span')
  const numComments = document.createElement('span')
  const commentsIcon = document.createElement('span')
  const cardTitle = document.createElement('h3')

  const ratingsEl = elementClasslist('div', 'ratingsEl')
  const likesCommentsCont = elementClasslist('div', 'likes-comm-cont')
  const commentsandNumCont = elementClasslist('div', 'commentsandNumCont')
  const likeandMessWrapper = elementClasslist('div', 'likeandMessWrapper')
  cardImg.src = tvShow.image.original
  cardTitle.textContent = tvShow.name

  card.classList.add('container-fluid', 'card')
  card.style.width = '18rem'
  cardImg.classList.add('card-img-top')
  likes.classList.add('fas', 'fa-heart')
  commentsIcon.classList.add('fas', 'fa-message')
  cardBody.classList.add('card-body')
  cardTitle.classList.add('card-title')

  const modal = createModalPage(tvShow)
  const username = modal.querySelector('.username')
  const userComments = modal.querySelector('.userComments')
  const errorMes = modal.querySelector('.error')
  const submitCommentBtn = modal.querySelector('.submit-btn')
  const displayCommentsElement = modal.querySelector('.display-comments')
  const commentsNumber = modal.querySelector('.commentsNum')
  errorMes.textContent = 'name and comment cannot be empty'

  async function sendComments (id, username, comment) {
    const apiUrl = 'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/Z7whx2c0JD54GeGnp2TU/comments'
    const commentsData = {
      item_id: id,
      username,
      comment
    }
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentsData)
      })
      res.ok ? getcomments(id) : console.log('Error posting comment')
    } catch (error) {
      console.error(error)
    }
  }
  function showComments (apiData) {
    displayCommentsElement.innerHTML = ''

    if (apiData) {
      const timeNow = new Date()
      // loop in reverse to display recent comments first
      for (let i = apiData.length - 1; i >= 0; i--) {
        const data = apiData[i]
        const timeOfComment = new Date(data.creation_date)
        const timeDiffInMillSec = timeNow - timeOfComment // result is in miliseconds
        const timeInDays = Math.floor(
          timeDiffInMillSec / (1000 * 60 * 60 * 24)
        ) // divide by 1000 to convert to sec, divide by 60 to convert to mins, divide by 60 to convert to hours and by 24 to convert to day
        let timeDiff = '' // initialized as empty so it can be reassigned and accessed by all scopes
        if (timeInDays === 0) {
          timeDiff = 'today'
        } else if (timeInDays === 1) {
          timeDiff = 'yesterday'
        } else {
          timeDiff = `${timeInDays} days ago`
        }

        const commentElement = elementClasslist('div', 'comment')
        const nameEL = elementContentAndClasslist(
          'span',
          data.username,
          'name'
        )
        const commentEl = elementContentAndClasslist(
          'span',
          data.comment,
          'comment'
        )
        const timeEl = elementContentAndClasslist(
          'span',
          timeDiff,
          'time'
        )

        commentElement.append(nameEL, commentEl, timeEl)
        displayCommentsElement.appendChild(commentElement)
      }
      if (apiData.length === undefined) {
        commentsNumber.innerText = `(${0})`
        numComments.innerText = 0 // ensures uncommented movies displays 0
      } else {
        commentsNumber.innerText = `(${apiData.length})`
        numComments.innerText = apiData.length
      }
      if (numComments.innerText > 0) {
        commentsIcon.style.color = '#704949'
      }
    }
  }

  async function getcomments (id) {
    const url = `https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/Z7whx2c0JD54GeGnp2TU/comments?item_id=${id}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      showComments(data)
    } catch (error) {
      console.error(error)
    }
  }

  getcomments(tvShow.id)

  async function sendLikes (id) {
    const url = 'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/Z7whx2c0JD54GeGnp2TU/likes'
    const dataBody = {
      item_id: id
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataBody)
      })
      if (res.ok) {
        console.log('like sent successfully')
        getLikes()
      }
    } catch (error) {
      console.log(error)
    }
  }

  getLikes()

  async function getLikes () {
    const url = 'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/Z7whx2c0JD54GeGnp2TU/likes'
    try {
      const res = await fetch(url)
      const data = await res.json()
      showLikes(data)
    } catch (error) {
      console.log(error)
    }
  }

  function showLikes (likesData) {
    likesData.filter((like) => {
      if (like.item_id === tvShow.id) {
        likesNum.innerText = like.likes
      }
    })
  }

  likes.addEventListener(
    'click',
    function (e) {
      sendLikes(tvShow.id)
      getLikes()
      e.target.style.color = 'red'
    },
    { once: true }
  )

  cardImg.addEventListener('click', () => {
    modal.style.display = 'block'
    getcomments(tvShow.id)
  })
  commentsIcon.addEventListener('click', () => {
    modal.style.display = 'block'
    getcomments(tvShow.id)
  })

  submitCommentBtn.addEventListener('click', () => {
    if (username.value !== '' && userComments.value !== '') {
      sendComments(tvShow.id, username.value, userComments.value)
      username.value = ''
      userComments.value = ''
    } else {
      errorMes.style.visibility = 'visible'
    }

    setTimeout(() => {
      errorMes.style.visibility = 'hidden'
    }, 2000)
  })

  function calcRatings (ratings) {
    const average = (ratings / 10) * 5 // to scale down ratings from 10 to five
    return average
  }

  function displayRatings () {
    const rating = calcRatings(ratingAve)
    // logic for rating icons
    if (rating === 1) {
      ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `
    } else if (rating > 1 && rating < 2) {
      ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star-half-stroke" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            `
    } else if (rating === 2) {
      ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `
    } else if (rating > 2 && rating < 3) {
      ratingsEl.innerHTML = `
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star-half-stroke" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `
    } else if (rating === 3) {
      ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            <i class="fa-regular fa-star"style="color: #ffd700;"></i>
            `
    } else if (rating > 3 && rating < 4) {
      ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star-half-stroke" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `
    } else if (rating === 4) {
      ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-regular fa-star" style="color: #ffd700;"></i>
            `
    } else if (rating > 4 && rating < 5) {
      ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star-half-stroke" style="color: #ffd700;"></i>
            `
    } else if (rating === 5) {
      ratingsEl.innerHTML = `
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            <i class="fa-solid fa-star" style="color: #ffd700;"></i>
            `
    }
  }

  displayRatings()

  commentsandNumCont.append(commentsIcon, numComments)

  likesCommentsCont.append(likes, likesNum)
  likeandMessWrapper.append(likesCommentsCont, commentsandNumCont)

  cardBody.append(cardTitle, ratingsEl, likeandMessWrapper)
  card.append(cardImg, cardBody, modal)

  return card
}

// populateShow();

function createModalPage (tvShow) {
  const modalPage = document.createElement('div')
  const modalContent = document.createElement('div')
  const closePageIcon = document.createElement('span')
  const showImage = document.createElement('img')
  const commentContainer = document.createElement('div')
  const inputName = document.createElement('input')
  const inputComment = document.createElement('textarea')
  const errorMessage = document.createElement('div')

  const showTitle = elementContentAndClasslist(
    'h2',
    tvShow.name,
    'showTitle'
  )
  const leftSection = elementClasslist('div', 'leftSection')
  const middleSection = elementClasslist('div', 'middleSection')
  const rightSection = elementClasslist('div', 'rightSection')
  const movieSection = elementClasslist('div', 'movieSection')
  const descSection = elementClasslist('div', 'descSection')
  const showDescription = elementClasslist('p', 'modal-text-desc');
  (displayComments = elementClasslist('div', 'displayComments')),
  (commentsHeading = elementClasslist('div', 'commentsHeading')),
  (displayCommentsBody = elementClasslist('div', 'display-comments')),
  (commentNameWrapper = elementClasslist('div', 'nameWrapper')),
  (commentMessageWrapper = elementClasslist('div', 'messageWrapper')),
  (commentsNum = elementClasslist('span', 'commentsNum'))

  const middleTitle = elementContentAndClasslist(
    'h2',
    'TV SHOW INFO',
    'middleTitle'
  )
  const addComment = elementContentAndClasslist(
    'h5',
    'Add Comment',
    'addcomment'
  );
  (commentSectionTitle = elementContentAndClasslist(
    'h5',
    'All Comments',
    'commentSectionTitle'
  )),
  (nameLabel = elementContentAndClasslist('label', 'Name', 'form-label')),
  (messageLabel = elementContentAndClasslist(
    'label',
    'Message',
    'form-label'
  )),
  (submitComment = elementContentAndClasslist(
    'button',
    'Submit',
    'submit-btn'
  ))
  const modalInner = elementClasslist('div', 'modalInner')
  const middleBody = elementClasslist('div', 'middleBody')
  middleBody.innerHTML = `
    <p class=''>${tvShow.network.name} (From ${tvShow.premiered} to ${tvShow.ended})</p>
    <p class=''><span class="fw-bold">Schedule:</span> ${tvShow.schedule.days[0]}s at ${tvShow.schedule.time} (${tvShow.averageRuntime}mins)</p>
    <p class=''><span class="fw-bold">Status:</span> ${tvShow.status}</p>
    <p class=''><span class="fw-bold">Show-type:</span> ${tvShow.type}</p>
    <p class=''><span class="fw-bold">Genres:</span> ${tvShow.genres[0]}, ${tvShow.genres[1]}, ${tvShow.genres[2]}</p>
    <p class=''><span class="fw-bold">Language:</span> ${tvShow.language}</p>
    <p class=''><span class="fw-bold">Download size:</span> ${tvShow.weight}mb</p>
    <p class=''><span class="fw-bold">Official site:</span> Visit <a href="${tvShow.officialSite}"class="text-decoration-none fst-italic">${tvShow.network.name}</a> </p>
    `

  closePageIcon.textContent = 'X'

  closePageIcon.addEventListener('click', () => {
    modalPage.style.display = 'none'
  })

  showDescription.innerHTML = tvShow.summary
  showImage.src = tvShow.image.medium

  modalPage.classList.add('modal')
  closePageIcon.classList.add('close')
  showImage.classList.add('modalImage')
  modalContent.classList.add('modal-content')
  inputName.classList.add('form-control', 'username')
  inputComment.classList.add('form-control', 'userComments')
  errorMessage.classList.add('error')

  inputName.placeholder = 'Enter name '
  inputComment.placeholder = 'Enter comment '

  commentNameWrapper.append(nameLabel, inputName)
  commentMessageWrapper.append(messageLabel, inputComment)
  commentContainer.append(
    errorMessage,
    addComment,
    commentNameWrapper,
    commentMessageWrapper,
    submitComment
  )

  movieSection.appendChild(showImage)
  descSection.appendChild(showDescription)
  leftSection.append(showTitle, movieSection, descSection)

  middleSection.append(middleTitle, middleBody)
  commentsHeading.append(commentSectionTitle, commentsNum)
  displayComments.append(commentsHeading, displayCommentsBody)

  rightSection.append(commentContainer, displayComments)

  modalInner.append(leftSection, middleSection, rightSection)
  modalContent.append(modalInner, closePageIcon)

  modalPage.append(modalContent)

  window.addEventListener('click', (e) => {
    if (e.target === modalPage) {
      modalPage.style.display = 'none'
    }
  })

  return modalPage
}
