'use strict'
const APIKey = 'OhfA7KfFwRf19i3x2ndjDzGDsXJbGbwv'
function renderBookList(responseObj){
    //for testing purposes: alert(responseObj.results.books[0].title)
    //render results to dom
    for(let i=0; i<=responseObj.results.books.length-1; i++){
        let bookTitle = responseObj.results.books[i].title;
        let bookCover = responseObj.results.books[i].book_image;
        let bookAuthor = responseObj.results.books[i].author;
        $('#resultsBox').append(
            `<div class="box" id="res${i}">`+
                `<h3 class="hidden">${bookTitle}</h3>`+
                `<h4 class='authorName hidden'>${bookAuthor}</h4>`+
                `<img src="${bookCover}" alt="Book Cover" class="coverImg">`+
                `<input type="button" value="Author Info" id="wBtn${i}" class="infoBtn">`+
                '<div class="wikiRes hidden"></div>'+
                `<input type="button" value="More Books" id="nytBtn${i}" class="infoBtn">`+
                '<div class="nytRes hidden"></div>'+
            '</div>'
        )
    }
}
function searchLists(dateToFetch, listToFetch){
    //make call to /lists/{date}/{list} endpoint
    let fetchListURL = `https://api.nytimes.com/svc/books/v3/lists/${dateToFetch}/${listToFetch}.json?api-key=${APIKey}`
    fetch(fetchListURL)
    .then(function(response){
        if(response.ok){
            return response.json();
        }
    })
    .then(function(responseJson){
        //pass response to be rendered
        renderBookList(responseJson);
    });
}
function searchSubmit(){
    //set vars to input values
    let listVal = $("#listSelect").val();
    let yearVal = $("#searchYear").val();
    let monthVal = $("#searchMonth").val();
    let dateVal = `${yearVal}-${monthVal}`;
    //pass listVal into books API /lists/overview.json 
    //endpoint to find list published dates
    let overviewURL = `https://api.nytimes.com/svc/books/v3/lists/overview.json?published_date=${dateVal}-01&api-key=${APIKey}`
    //find the first date published for the month/year input by user
    let fetchDate;
    fetch(overviewURL)
        .then(function(response){
            if (response.ok){
                return response.json(); 
            }
        })
        .then(function(responseJson){
            //set correct date published
            fetchDate = responseJson.results.published_date;
            searchLists(fetchDate, listVal)
        })
    //fetch the lists
}
function wikiBtnClicked(clickEvent){
    $(`#${clickEvent.currentTarget.id}`).removeAttr('id')
    //format author name and  pass to url for fetch()
    let selectedResultID = clickEvent.target.parentElement.id
        //fetch info from wikipedia
    let wikiString = $(`#${selectedResultID}`).children('.authorName').text();
    let wikiStringFormatted = wikiString.replace(' ', '%20')
    let wikiURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiStringFormatted}`
    fetch(wikiURL)
        .then(function(response){
            let statusNum = response.status;
            if (statusNum === 404){
                //author string not recognized by wikipedia api
                //display message to user in wikiresults box
                $(`#${selectedResultID}`).children('.wikiRes').append("<p>This author's name does not have a corresponding Wikipedia article. You can request that one be made <a href='https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation'>here</a></p>")
                $(`#${selectedResultID}`).children('.wikiRes').toggleClass('hidden')
            }
            else if(response.ok){
                return response.json();
            }
        })
        .then(function(responseJson){
            let resType = responseJson.type;
            if(resType === 'standard'){
                //show description blurb if response is standard article
                let authWikiInfo = responseJson.extract_html;
                $(`#${selectedResultID}`).children('.wikiRes').append(`${authWikiInfo}`)

            }else if(resType === 'disambiguation'){
                //show disambiguation list if response is disambiguation page
                let disamText = responseJson.extract_html;
                $(`#${selectedResultID}`).children('.wikiRes').append(`${disamText}`)
            }else{
                //author string not recognized by wikipedia api
                //display message to user in wikiresults box
                $(`#${selectedResultID}`).children('.wikiRes').append("<p>This author's name does not have a corresponding Wikipedia article. You can request that one be made <a href='https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation'>here</a></p>")
            }
            $(`#${selectedResultID}`).children('.wikiRes').toggleClass('hidden')
        })
}
function linksBtnClicked(clickEvent){
    $(`#${clickEvent.currentTarget.id}`).removeAttr('id')
    //format author name and  pass to url for fetch()
    //https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?author=Daniel%20Silva&api-key=
    //format author name and  pass to url for fetch()
    let selectedResultID = clickEvent.target.parentElement.id
        //fetch info from wikipedia
    let nytString = $(`#${selectedResultID}`).children('.authorName').text();
    let nytStringFormatted = nytString.replace(' ', '%20')
    let nytURL = `https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?author=${nytStringFormatted}&api-key=${APIKey}`
    fetch(nytURL)
        .then(function(response){
            if(response.ok){
                return response.json();
            }
        })
        .then(function(responseJson){
            let numBooks = responseJson.results.length;
            $(`#${selectedResultID}`).children('.nytRes').append(
                `<h5>More Books by ${nytString}:</h5>`+
                '<ul class="authBookList"></ul>')
            for(let i=0; i<=numBooks-1; i++){
                let bookToAdd = responseJson.results[i].title;
                $(`#${selectedResultID}`).children('.nytRes').children('.authBookList').append(
                    `<li>${bookToAdd}</li>`
                )
            }
            $(`#${selectedResultID}`).children('.nytRes').toggleClass('hidden')
        })
}
function hiderFunc(clickEvent, btnClkd){
    //hides/shows wikipedia info/nyt books after first click on btn
    let selectedResultID = clickEvent.target.parentElement.id
    if (btnClkd>0){
        //nyt clicked
        $(`#${selectedResultID}`).children('.nytRes').toggleClass('hidden');
    }else{
        //wiki clicked
        $(`#${selectedResultID}`).children('.wikiRes').toggleClass('hidden');
    }
}
function handleResultsClick(clickEvent){
    let currentVal = clickEvent.currentTarget.value; 
    if (currentVal === 'Author Info'){
        if(clickEvent.currentTarget.id === ''){
            hiderFunc(clickEvent, 0);
        }else{
            wikiBtnClicked(clickEvent);
        }
    }else{
        if(clickEvent.currentTarget.id === ''){
            hiderFunc(clickEvent, 1);
        }else{
            linksBtnClicked(clickEvent);
        }        
    }
    //after data is displayed, each click hides/shows info
}
function handleUserInput(){  
    //at page load, listen for clicks on start button
    // on click, hide start button, unhide search bar.
    $('#startBtn').on('click', function(e){
        $('#startBtn').toggleClass('hidden')
        $('.searchBar').toggleClass('hidden')
    })
    //handle clicks on about button
    $('#aboutBtn').on('click', function(e){
        $('.pageInfo').toggleClass('hidden');
    })
    //handle clicks on search button
    $('#searchSubmit').on('click', function(e){
        event.preventDefault();
        $('#resultsBox').children().remove();
        //pass form information to NYT API
        searchSubmit();
    })
    //listen for clicks on wikipedia and nyt links buttons in results
    
    $('#resultsBox').on('click', '.infoBtn', function(e){
        handleResultsClick(e);
    })
}
$(handleUserInput());