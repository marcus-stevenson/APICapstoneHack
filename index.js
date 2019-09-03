'use strict'
const APIKey = 'OhfA7KfFwRf19i3x2ndjDzGDsXJbGbwv'
function renderBookList(responseObj){
    alert(responseObj.results.books[0].title)
}
function searchSubmit(){
    //set vars to input values
    let listVal = $("#listSelect").val();
    let dateVal = $("#dateSelect").val();
    //pass listVal into books API /lists/overview.json 
    //endpoint to find list published dates
    let overviewURL = `https://api.nytimes.com/svc/books/v3/lists/overview.json?published_date=${dateVal}-01&api-key=${APIKey}`
    //find the first date published for the month/year input by user
    let fetchDate
    fetch(overviewURL)
        .then(function(response){
            if (response.ok){
                console.log(overviewURL)
                return response.json(); 
            }
        })
        .then(function(responseJson){
            fetchDate = responseJson.results.published_date;
            console.log(fetchDate)
        })
    //fetch the lists
    let fetchListURL = `https://api.nytimes.com/svc/books/v3/lists/${fetchDate}/${listVal}.json?api-key=${APIKey}`
    fetch(fetchListURL)
    .then(function(response){
        if(response.ok){
            console.log(fetchListURL)
            return response.json();
        }
    })
    .then(function(responseJson){
        //pass response to be rendered
        renderBookList(responseJson);
    })
}
function handleUserInput(){
    //handle clicks on about button
    $('#aboutBtn').on('click', function(e){
    })
    //handle clicks on reset form button
    $('#searchReset').on('click', function(e){
    })
    //handle clicks on search button
    $('#searchSubmit').on('click', function(e){
        event.preventDefault();
        //pass form information to NYT API
        searchSubmit();
    })
}
$(handleUserInput());