ACHIEVEMENTS = [
    [
        "I'm good on my own",
        "Escape from the second room without getting any items."
    ],
    [
        "Top percentage",
        "Get your Magikarp to level 10."
    ],
    [
        "0x Up Presses",
        "Escape from the fourth room without ever pressing Up <i>(in the overworld)</i>."
    ],
    [
        "Guard Skip",
        "Escape from the fifth room by bypassing the guard completely."
    ],
    [
        "Pok&eacute;dex flags are weird",
        "Get a Pokemon registered as seen in the Pokedex, but not owned <i>(through the GivePokemon subroutine)</i>."
    ],
    [
        "Did I getcha?",
        "It says 'gullible' on the ceiling, and the ceiling is out of bounds."
    ],
    [
        "31337",
        "This achievement is unobtainable through normal means. You know what to do!"
    ]
];

function entities(s){
    return $('<div>').text(s).html();
}

function getApiEndpoint(name){
    return "api/" + name + ".json?_=" + Math.random();
}

function updateAchievementTooltips(){
    $('[data-tooltip]').each(function(a, e){
        var achievement = ACHIEVEMENTS[parseInt(e.getAttribute('data-tooltip'))];
        e.setAttribute('data-tooltip-content', "<b>" + achievement[0] + "</b><br><span class='subtitle'>" + achievement[1] + "</span>");
        e.title = e.getAttribute('data-tooltip-content');
        $(e).tooltip({html: true});
        e.title = '';
    });
}

function formatTime(time){
    var seconds = time[1].toString();
    if (seconds.length <= 1) seconds = "0" + seconds;
    return time[0] + ":" + seconds;
}

function createAchievementString(achievements){
    var final = "";
    for (var i=0; i<achievements.length; i++){
        var achievement = "<div class='achievement "
        if (!achievements[i]) achievement += "not-";
        achievement += "achieved' data-tooltip='" + i + "'>";
        achievement += "<img src='img/" + i + ".png'></div> ";
        final += achievement;
    }
    return final;
}

function loadHighscores(){
    $('#highscore_table').find('td:not(.servicing)').parent().remove();
    $('#highscore_loader').show();
    $('#highscore_error').hide();
    var ajax = $.get(getApiEndpoint("highscores"));
    ajax.done(function(data){
        try {
            if (typeof(data) != "object") data = JSON.parse(data);
            if (data['success']){
                $('#highscore_loader').hide();
                data = data['data'];
                if (data.length){
                    for (var i=0; i<data.length; i++){
                        var row = $('<tr>');
                        row.append($('<td>').text(i + 1));
                        row.append($('<td>').text(data[i]['username']));
                        row.append($('<td>').html("<b>" + parseInt(data[i]['score']) + "</b>"));
                        row.append($('<td>').text(formatTime(data[i]['time'])));
                        row.append($('<td>').html(createAchievementString(data[i]['achievements'])));
                        $('#highscore_table').append(row);
                        row = $('<tr>');
                        if (data[i]['message'].length > 0){
                            row.append($('<td class="message" colspan="5">').text(data[i]['message']));
                        }else{
                            row.append($('<td class="message" colspan="5">')
                                       .html("<i style='font-weight: normal'>(didn't leave a message)</i>"));
                        }
                        $('#highscore_table').append(row);
                    }
                }else{
                    var row = $('<tr>');
                    row.append($('<td colspan="5">').html("<i>No scores submitted yet. Be the first!</i>"));
                    $('#highscore_table').append(row);
                }
                updateAchievementTooltips();
            }else{
                $('#highscore_error').show();
                $('#highscore_loader').hide();
            }
        }catch(e){
            $('#highscore_error').show();
            $('#highscore_loader').hide();
        }
    });
    ajax.fail(function(data){
        $('#highscore_error').show();
        $('#highscore_loader').hide();
    });
}

function transition(a, b, complete){
    $(a).slideUp(400);
    if (complete) $(b).slideDown(400, complete);
    else $(b).slideDown(400);
}

function checkPassword(){
    var data = decode_password($('#local_test_pass').val().toUpperCase().trim());
    if (!data){
        $('#upload_score_form_info').html("<b>Error</b>: The password is invalid...");
        $('#upload_score_achievements').html("");
    }else{
        $('#upload_score_achievements').html(createAchievementString(data['achievements']));
        var description = "";
        description = "Score: <b>" + password_score(data) + "</b>, gameplay time: " + formatTime(data['time']);
        $('#upload_score_form_info').html(description);
        updateAchievementTooltips();
    }
    transition("#submit_score_loader", "#upload_score_form");
}

function uploadScore(){
    var ajax = $.post(getApiEndpoint("upload_score"),
                      {
                          user: $('#submit_score_user').val(),
                          pass: $('#submit_score_pass').val(),
                          old_pass: $('#upload_score_previous_pass').val(),
                          message: $('#upload_score_message').val()
                      });
    
    ajax.done(function(data){
        if (data['success']){
            localStorage['last_username'] = $('#submit_score_user').val();
            localStorage['last_password'] = $('#submit_score_pass').val();
            $('#upload_score_previous_pass').val(localStorage['last_password']);
            localStorage['last_message'] = $('#upload_score_message').val();
            transition("#upload_score_loader","#upload_score_success");
        }else{
            $("#upload_score_error_msg").text(data['reason']);
            transition("#upload_score_loader","#upload_score_error");
        }
    });
    ajax.fail(function(xhr){
        $("#upload_score_error_msg").text("The request returned status code " + xhr.status);
        transition("#upload_score_loader","#upload_score_error");
    });
}

function updateTimer(){
    var time_end = 1491393600;
    var time_now = Math.floor((+new Date())/1000);
    var time_diff = time_end - time_now;
    if (time_diff < 0){
        $('#event_timer').html("<i>The event is over. Thanks everyone for participating!</i>");
    }else{
        var time_split = [];
        time_split.push(time_diff % 60);
        time_diff = Math.floor(time_diff / 60);
        time_split.push(time_diff % 60);
        time_diff = Math.floor(time_diff / 60);
        time_split.push(time_diff % 24);
        time_diff = Math.floor(time_diff / 24);
        time_split.push(time_diff);
        time_split.reverse();
        var suffixes = ["days", "hours", "minutes", "seconds"];
        for (var i=0; i<suffixes.length; i++){
            suffixes[i] = time_split[i] + " " + suffixes[i];
        }
        $('#event_timer').html("<i>" + suffixes.join(", ") + " until the end of the event</i>");
    }
}

$(document).ready(function(){
    updateTimer();
    updateAchievementTooltips();
    loadHighscores();
    setInterval(updateTimer, 1000);
});

