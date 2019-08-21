$(document).ready(function () {
    loadVideoList();

    $("#add-video-btn").click(addVideo);
});

const loadVideoList = () => {
    getVideos().then(renderVideos);
};

const addVideo = () => {
    const titleInput = $("#title");
    const urlInput = $("#url");
    const postData = {
        id: +Date.now().toString().substring(3, 11),
        title: titleInput.val(),
        link: urlInput.val(),
        points: 0
    };

    titleInput.val('');
    urlInput.val('');

    // Add video to the object store
    addObject("videos", postData)
        .catch(e => console.error(e));

    $.ajax({
       type: 'POST',
       url: 'http://localhost:3000/videos',
       data: JSON.stringify(postData),
       success: renderVideos,
       contentType: 'application/json',
       dataType: 'json'
    });
};

const vote = (votingUp, id) => {
    let url = 'http://localhost:3000/videos/' + id;
    url += votingUp ? '/up' : '/down';

    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({}),
        success: renderVideos,
        contentType: 'application/json',
        dataType: 'json'
    });
};

const renderVideos = (videos) => {
    $("#video-list").empty();
    for (const video of videos) {
        renderVideo(video);
    }
};

const renderVideo = (video) => {
    $("#video-list").append('<li class="list-group-item" id="' + video.id + '">' +
        '<a href="#" class="fas fa-arrow-up p-2 black" onclick="vote(true, ' + video.id + ')"></a>' +
        '<span class="badge badge-primary p-2"> ' + video.points + ' </span>' +
        '<a href="#" class="fas fa-arrow-down p-2 black" onclick="vote(false, ' + video.id + ')"></a>' +
        '<a href="' + video.link + '" target="_blank">' + video.title + '</a>' +
        '</li>')
};