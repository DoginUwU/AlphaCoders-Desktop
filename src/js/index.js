const axios = require('axios'); 
var home = require("os").homedir();
var fs = require("fs");
var Jimp = require('jimp');
const wallpaperReplace = require('wallpaper');
var page = 1;
var total_match = 0;
const remote = require ("electron").remote;
const { dialog } = require('electron').remote
var monitorWidth = 0;
var monitorHeight = 0;

document.addEventListener("DOMContentLoaded", function(){
    monitorWidth = remote.screen.getPrimaryDisplay().size.width;
    monitorHeight = remote.screen.getPrimaryDisplay().size.height;
    $("#pagesbtn").hide();
    setInterval(function(){
        if ($(".result")[0] && total_match > 0){
            $("#pagesbtn").show();
        }else{
            $("#pagesbtn").hide();
        }
    }, 500);
})

async function previousButton(){
    if(page >= 2){
        page--;
        searchWallpapers(false);
    }
}
async function nextButton(){
    if(page < (total_match / 30))
    {
        page++;
        searchWallpapers(false);
    }
}

async function searchWallpapers(newSearch){
    if(newSearch) page = 1;
    if($('.search_bar').val() === "") return;
    $('.result').remove();
    var terms = encodeURI($('.search_bar').val());
    await axios.get('https://wall.alphacoders.com/api2.0/get.php?auth=42ce97adfbfa19a8bdaedd3c5e283476&method=search&term='+terms+'&info_level=3&page='+page).then(response => {
        var wallpapers = response.data.wallpapers;
        total_match = response.data.total_match;
        for (let index = 0; index < wallpapers.length; index++) {
            const element = wallpapers[index];
            var html = "<div class='result' onclick='openWallpaper("+element.id+")'>"+
            "<img src='"+element.url_thumb+"'>"+
            "<div class='description'>"+
                "<p>"+element.sub_category+"</p>"+
            "</div>"+
            "</div>";
            $(html).appendTo('.results');
            $('.actualPage').text(page);
        }
    }).catch(err => {
        console.log(err);
    });
}

async function openWallpaper(id){
    await axios.get('https://wall.alphacoders.com/api2.0/get.php?auth=42ce97adfbfa19a8bdaedd3c5e283476&method=wallpaper_info&id='+id).then(response => {
        var wallpaper = response.data.wallpaper;
        console.log(wallpaper);
        $('.ui.dimmer .info .title').text(wallpaper.name != "" ? wallpaper.name : wallpaper.sub_category);
        $('.ui.dimmer').dimmer('show');
        $('.ui.dimmer .info img').attr("src", wallpaper.url_thumb);
        $('.ui.dimmer .info .uploaded').text("Enviado por: " + wallpaper.user_name);
        $('.ui.dimmer .info .category').text("Categoria: " + wallpaper.category);

        $('.downloadWallpaper').on("click", function(){
            Jimp.read(wallpaper.url_image).then(lenna => {
               

                dialog.showOpenDialogSync({
                    properties: ['openDirectory'],
                    defaultPath: home + "/pictures/Wallpapers/"
                }).then(response => {
                    lenna
                    .quality(100)
                    .write(response.filePaths[0]+id+".jpg"); 
                })
                
                $('.ui.dimmer').dimmer('hide');
              })
              .catch(err => {
                console.error(err);
            });
            
        })

        $('.ui.dimmer .downloads .apply').on("click", function(){
            Jimp.read(wallpaper.url_image).then(lenna => {
                lenna
                  .crop(0,0,monitorWidth,monitorHeight)
                  .quality(100)
                  .write(home + "/pictures/Wallpapers/"+id+".jpg"); 
                  (async () => {
                    await wallpaperReplace.set(home + "/pictures/Wallpapers/"+id+".jpg");
                
                    await wallpaperReplace.get();
                    })();
                $('.ui.dimmer').dimmer('hide');
              })
              .catch(err => {
                console.error(err);
              });
        });
        $('.ui.dimmer .downloads .applyIMG').on("click", async function(){
           
            require("electron").remote.require("electron-download-manager").download({
                url: wallpaper.url_image
            }, function (error, info) {
                if (error) {
                    console.log(error);
                    return;
                }
                (async () => {
                    await wallpaperReplace.set(info.filePath);
                
                    await wallpaperReplace.get();
                    })();
                $('.ui.dimmer').dimmer('hide');
            });

           
        });
    }).catch(err => {
        console.log(err);
    });
}