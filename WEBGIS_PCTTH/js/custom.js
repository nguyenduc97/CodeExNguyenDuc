$(function() {
    $('[rel=popover]').popover();
    var click = true;
    $('.ddc_close').on('click', function() {
        var allpopup = document.querySelectorAll('.ddc_popup');
        for (var pp of allpopup) {
            pp.style.display = "none";
        }
    });
    // click infotable hide popup left
    $('.ddc_infoTable').click(function(e) {
        var container = $(".ddc_popup");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.hide();
            click = true;
        }
    });

    // Click menu
    $('.showhidepopup').on("click", function() {
        var tab = this;
        var active = document.querySelector(".active");
        if (active) {
            active.classList.remove("active");
        }
        tab.classList.add("active");
        var allContent = document.querySelectorAll('.ddc_content_pop');
        for (var content of allContent) {
            if (content.getAttribute('data-content-popup') === tab.getAttribute('data-content-popup')) {
                content.style.display = "block";
            } else {
                content.style.display = "none";
            }
        }
    })

    //Custom upload file demo
    $('#btn-search-file').on("click", function() {
        document.getElementById("input-coordinates").click();
    })

    //append input tọa độ
    $(document).ready(function() {
        for (var i = 1; i <= 4; i++) {
            addInput();
        }
    })
    // Collapsible Card
    $('a[data-action="collapse"]').on('click',function(e){        
        e.preventDefault();
        $(this).closest('.ddc_container').children('.card-content').collapse('toggle');
        $(this).closest('.ddc_container').find('[data-action="collapse"] i').toggleClass('ft-minus ft-plus');

    });
    // Toggle fullscreen
    var setFull =true;
    $('a[data-action="expand"]').on('click',function(e){
        e.preventDefault();
        var setWmap = $(this).closest('.ddc_container').find('#viewDiv');        
        if(setWmap.length > 0 && setFull){
            $('#viewDiv').css('height','90vh');
            setFull = !setFull;
        }else if(setWmap.length > 0 && setFull==false){
            $('#viewDiv').css('height','50vh');
            setFull = !setFull;
        }
        $(this).closest('.ddc_container').find('[data-action="expand"] i').toggleClass('ft-maximize ft-minimize');
        $(this).closest('.ddc_container').toggleClass('card-fullscreen');
    });
    $('a[data-action="logout"]').on('click',function(){
        alert("Chức năng chưa làm, vui vòng coi console");
        console.log("Không làm mà đòi ăn à");
    });
});

function addInput() {
    var num = document.querySelectorAll(".DellInput");
    var stt = num.length + 1;
    var str = `<div class="DellInput">
    <div class="input-group input-group-sm">
    <div class="input-group-prepend">
    <span class="input-group-text setidlocation">${stt}</span>
    </div>
    <input id="toadox${stt}" name="toadox${stt}"  type="number" class="form-control toadox" placeholder="1199748.55">
    <input id="toadoy${stt}" name="toadoy${stt}"  type="number" class="form-control toadoy" placeholder="6112451.93">
    <div class="input-group-append">
    <button type="button" class="BtnDell btn btn-danger">
    <i class="fa fa-trash-o" aria-hidden="true"></i>
    </button>
    </div>
    </div>
    <div style="text-align: center; font-size: 12px; color:red; height: 18px !important; display: flex;">
    <smail id="textX${stt}" style="margin-left: 7%;" class="col-5"></smail>
    <smail id="textY${stt}" style="margin-left: 0%;" class="col-5"></smail>
    </div>
    </div>`
    $('#setD').append(str);
    $('.BtnDell').on('click', DEL);
};

function DEL(e) {
    var setstt = document.querySelectorAll(".DellInput");
    $(this).closest('.DellInput').remove();
    var tt = 1;
    var setstt = document.querySelectorAll(".setidlocation");
    setstt.forEach(element => {
        element.innerHTML = tt;
        tt++;
    });
}
//append input tọa độ

//hiển thị popup cài tiện ích
function showHD() {
    $('#cookiePopup').modal('show');
}

//Check nhập tọa độ XY
function CheckToaDoXY() {
    var qrToaDox = document.querySelectorAll(".toadox");
    var qrToaDoy = document.querySelectorAll(".toadoy");
    for (i = 0; i < qrToaDox.length; i++) {
        var keyx = i + 1
        var keyy = i + 1
        if (document.getElementById('toadox' + keyx).value == "" && document.getElementById('toadoy' + keyy).value == "") {
            document.getElementById('textX' + keyx).innerHTML = "Nhập tọa độ X";
            document.getElementById('textY' + keyy).innerHTML = "Nhập tọa độ Y";
        } else if (document.getElementById('toadox' + keyx).value != "" && document.getElementById('toadoy' + keyy).value == "") {
            document.getElementById('textY' + keyy).innerHTML = "Nhập tọa độ Y";
            document.getElementById('textX' + keyx).innerHTML = "";
        } else if (document.getElementById('toadox' + keyx).value == "" && document.getElementById('toadoy' + keyy).value != "") {
            document.getElementById('textX' + keyx).innerHTML = "Nhập tọa độ X";
            document.getElementById('textY' + keyy).innerHTML = "";
        } else {
            document.getElementById('textX' + keyx).innerHTML = "";
            document.getElementById('textY' + keyy).innerHTML = "";
        }
    }
}