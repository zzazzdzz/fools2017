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
    return "api/" + name + ".json";
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
    var ajax = $.get(getApiEndpoint("check_password"),
                     {user: $('#submit_score_user').val(), pass: $('#submit_score_pass').val()});
    ajax.done(function(data){
        if (data['success']){
            data = data['data'];
            $('#upload_score_achievements').html(createAchievementString(data['achievements']));
            $('.chosen-username').html(entities($('#submit_score_user').val()));
            var username = "<b>" + entities($('#submit_score_user').val()) + "</b>";
            var description = "";
            if (!data['previous_entry']){
                description = "You are entering a new score under the username " + username + ".";
                $('.upload-security-msg').hide();
            }else{
                description += "You are changing a previously submitted score by " + username + ".";
                $('.upload-security-msg').show();
            }
            description += "<br>Score: <b>" + data['score'] + "</b>, gameplay time: " + formatTime(data['time']);
            $('#upload_score_form_info').html(description);
            updateAchievementTooltips();
            if (!data['previous_entry']){
                transition("#submit_score_loader", "#upload_score_form");
            }else{
                transition("#submit_score_loader", "#upload_score_username_warning");
            }
        }else{
            $("#submit_score_error_msg").text(data['reason']);
            transition("#submit_score_loader","#submit_score_error");
        }
    });
    ajax.fail(function(xhr){
        $("#submit_score_error_msg").text("The request returned status code " + xhr.status);
        transition("#submit_score_loader","#submit_score_error");
    });
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
    if (localStorage['last_username']){
        $('#submit_score_user').val(localStorage['last_username']);
    }
    if (localStorage['last_password']){
        $('#submit_score_pass').val(localStorage['last_password']);
        $('#upload_score_previous_pass').val(localStorage['last_password']);
    }
    if (localStorage['last_message']){
        $('#upload_score_message').val(localStorage['last_message']);
    }
    setInterval(updateTimer, 1000);
});

