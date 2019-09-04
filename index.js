'use strict'
const APIKey = 'OhfA7KfFwRf19i3x2ndjDzGDsXJbGbwv'
function renderBookList(responseObj){
    //for testing purposes: alert(responseObj.results.books[0].title)
    //render results to dom
    $('#resultsBox').append(`<p>Results:${responseObj.num_results}</p>`)
    for(let i=0; i<=responseObj.results.books.length-1; i++){
        let bookTitle = responseObj.results.books[i].title;
        let bookCover = responseObj.results.books[i].book_image;
        let bookAuthor = responseObj.results.books[i].author;
        $('#resultsBox').append(
            `<div class="box" id="res${i}">`+
                `<h3>${bookTitle}</h3>`+
                `<h4 class='authorName'>${bookAuthor}</h4>`+
                `<img src="${bookCover}" alt="Book Cover">`+
                `<input type="button" value="Wikipedia info" id="wBtn${i}" class="infoBtn">`+
                '<div class="wikiRes"></div>'+
                `<input type="button" value="NYT Links" id="nytBtn${i}" class="infoBtn">`+
                '<div class="nytRes"></div>'+
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
    let dateVal = $("#dateSelect").val();
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
            if(response.ok){
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
            }
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
    if (currentVal === 'Wikipedia info'){
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
//
/*function populateListOptions(){
    let optionURL = `https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${APIKey}`
    fetch(optionURL)
        .then(function(response){
            if (response.ok){
                return response.json();
            } 
        })
        .then(function(responseJson){
            let numOptions = responseJson.results.length
            for(let i=0; i<=numOptions-1; i++){
                let currentOptName = responseJson.results[i].list_name;
                let currentOptValue = responseJson.results[i].list_name_encoded;
                $('#listSelect').append(`<option value="${currentOptValue}">${currentOptName}</option>`)
            }
        })
}*/
function handleUserInput(){
    //populate list options
    //populateListOptions();
    //will fix this feature later
    //this populates the list options automatically using the nyt books /lists/names
    //endpoint but needs some work because some lists have been discontinued but still
    //show up, causing errors when fetching... 
    //limit date input by 'newest_published_date'/'oldest_published_date'?
    

    //handle clicks on about button
    $('#aboutBtn').on('click', function(e){
    })
    //handle clicks on reset form button
    $('#searchReset').on('click', function(e){
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