$(document).ready(function() {
    // Resizable windows
    $('.windows').resizable();

    // Draggable components - Updated for win-top-bar handles
    $(".draggable").draggable({
        handle: ".handle, .win-top-bar",
        cursor: 'move'
    });
    $('.droppable').droppable({
        drop: handleDropEvent
    });

    function handleDropEvent(event, ui) {
        var draggable = ui.draggable;
        alert('No thanks!');
    }

    $(".draggable-1").draggable({
        containment: '#contain-1',
        cursor: 'move'
    });

    $(".draggable-2").draggable({
        containment: '#contain-2',
        cursor: 'move'
    });

    // Wallpaper toggle functionality
    $('.bb-itel').on('click', function(e) {
        e.preventDefault();
        
        // Hide all backgrounds
        $('.bg-desktop, .bg-desktop-basic').hide();
        
        // Get index from data-w-id or order (1=hero/0, 2=meme1/1, 3=FREN/2, etc.)
        var index = $(this).index('.bb-itel');
        var bgIndex = index === 0 ? 'basic' : index;
        
        // Show selected
        if (bgIndex === 'basic') {
            $('.bg-desktop-basic').show();
        } else {
            $('.bg-desktop._' + bgIndex).show();
        }
    });
    
    // Default: show FREN (_3)
    $('.bg-desktop._3').show();

    // ===== MEMES EXPLORER FUNCTIONALITY =====
    let memesWindowOpen = false;

    // Click handlers for memes icons
    $('#desktop-memes, #mobile-memes').on('click', function(e) {
        e.preventDefault();
        toggleMemesExplorer();
    });

    // Window controls
    $(document).on('click', '.memes-explorer .close, .memes-explorer .minimize', function(e) {
        e.preventDefault();
        $('#memes-explorer').hide();
        memesWindowOpen = false;
    });

    // Fullscreen toggle (bonus)
    $(document).on('click', '.memes-explorer .fullscreen', function(e) {
        e.preventDefault();
        const win = $('.memes-explorer');
        win.toggleClass('fullscreen-window');
    });

    // Overlay close
    $('#meme-overlay').on('click', function() {
        $(this).hide();
    });

    // ESC key close overlay
    $(document).on('keyup', function(e) {
        if (e.key === 'Escape') {
            $('#meme-overlay').hide();
        }
    });

    function toggleMemesExplorer() {
        const win = $('#memes-explorer');
        if (memesWindowOpen) {
            win.hide();
            memesWindowOpen = false;
        } else {
            // Position window
            win.css({
                'display': 'block',
                'z-index': 20,
                'transform': 'translate3d(0, 0, 0) scale3d(1, 1, 1)'
            });
            memesWindowOpen = true;
            
            // Default to images tab
            $('.sidebar-item').removeClass('active').eq(1).addClass('active');
            loadContent('images');
        }
    }
    
    // Sidebar tab switching
    $(document).on('click', '.explorer-sidebar .sidebar-item', function(e) {
        e.preventDefault();
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        const type = $(this).index() === 1 ? 'images' : $(this).index() === 2 ? 'videos' : 'images';
        loadContent(type);
    });

    function loadImages() {
        $.getJSON('public/images.json')
            .done(function(files) {
                const grid = $('#meme-grid');
                grid.empty();
                files.forEach(function(file) {
                    const thumb = $(`
                        <div class="meme-thumb" data-fullsrc="public/${file}">
                            <img src="public/${file}" alt="${file}" loading="lazy">
                            <span>${file.split('/').pop()}</span>
                        </div>
                    `);
                    thumb.on('click', function() {
                        const fullSrc = $(this).data('fullsrc');
                        showFullscreenMedia(fullSrc);
                    });
                    grid.append(thumb);
                });
            })
            .fail(function() {
                console.error('Failed to load images JSON');
                $('#meme-grid').html('<p style="text-align:center; color:#666;">No images found. Check console.</p>');
            });
    }
    
    function loadVideos() {
        $.getJSON('public/videos.json')
            .done(function(files) {
                const grid = $('#meme-grid');
                grid.empty();
                files.forEach(function(file) {
                    const thumb = $(`
                        <div class="meme-thumb" data-fullsrc="public/${file}">
                            <video src="public/${file}" muted preload="metadata" width="60" height="60">
                                <img src="public/${file.split('.mp4')[0]}.png" alt="${file}" loading="lazy">
                            </video>
                            <span>${file.split('/').pop()}</span>
                        </div>
                    `);
                    thumb.on('click', function() {
                        const fullSrc = $(this).data('fullsrc');
                        showFullscreenMedia(fullSrc);
                    });
                    grid.append(thumb);
                });
            })
            .fail(function() {
                console.error('Failed to load videos JSON');
                $('#meme-grid').html('<p style="text-align:center; color:#666;">No videos found. Check console.</p>');
            });
    }
    
    function loadContent(type) {
        if (type === 'videos') {
            loadVideos();
        } else {
            loadImages();
        }
    }

    function showFullscreenMedia(src) {
        const overlayContent = $('.overlay-content');
        const overlay = $('#meme-overlay');
        overlayContent.empty();
        
        if (src.endsWith('.mp4')) {
            const video = $(`<video src="${src}" autoplay controls style="max-width: 90vw; max-height: 90vh; object-fit: contain;"></video>`);
            overlayContent.append(video);
            $('.download-btn').hide();
        } else {
            const img = $(`<img src="${src}" alt="Fullscreen media" class="fullscreen-meme" style="max-width: 90vw; max-height: 90vh; object-fit: contain;" data-src="${src}">`);
            overlayContent.append(img);
            // Add download button for images
            let downloadBtn = $('.download-btn');
            if (downloadBtn.length === 0) {
                downloadBtn = $(`
                    <a href="#" class="download-btn" download>
                        <span class="download-icon"></span>
                        Download
                    </a>
                `);
                $('body').append(downloadBtn);
                downloadBtn.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const imgSrc = overlayContent.find('img').data('src');
                    if (imgSrc) {
                        const a = document.createElement('a');
                        a.href = imgSrc;
                        a.download = imgSrc.split('/').pop();
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                });
            }
            downloadBtn.show();
            overlay.addClass('has-download');
        }
        
        overlay.fadeIn(200);
        overlay.css('display', 'flex');
    }

// ===== FREN BROWSER FUNCTIONALITY =====
let browserWindowOpen = false;

// Click handlers for browser icons
$('#desktop-browser, #mobile-browser').on('click', function(e) {
    e.preventDefault();
    toggleBrowserWindow();
});

// Window controls for fren-browser
$(document).on('click', '.browser .close, .browser .minimize', function(e) {
    e.preventDefault();
    $('#fren-browser').hide();
    browserWindowOpen = false;
});

$(document).on('click', '.browser .fullscreen', function(e) {
    e.preventDefault();
    const win = $('.browser');
    win.toggleClass('fullscreen-window');
});

function toggleBrowserWindow() {
    const win = $('#fren-browser');
    if (browserWindowOpen) {
        win.hide();
        browserWindowOpen = false;
    } else {
        win.css({
            'display': 'block',
            'z-index': 25,
            'transform': 'translate3d(0, 0, 0) scale3d(1, 1, 1)'
        });
        browserWindowOpen = true;
    }
}

// ===== DEXSCREENER WINDOW FUNCTIONALITY =====
let dexscreenerWindowOpen = false;

// Icon click handlers (desktop + mobile)
$('#w-node-fa4deacf-3362-9193-6a55-654a6f8eb513-fa5940a2, #w-node-_9ff49ee7-9df5-3515-58d0-d6f006c50544-fa5940a2').on('click', function(e) {
    e.preventDefault();
    toggleDexscreenerWindow();
});

// Window controls
$(document).on('click', '.windows.dexscreener .close, .windows.dexscreener .minimize', function(e) {
    e.preventDefault();
    $('.windows.dexscreener').css({display: 'none', transform: 'scale3d(0, 0, 1)'});
    dexscreenerWindowOpen = false;
});

$(document).on('click', '.windows.dexscreener .fullscreen', function(e) {
    e.preventDefault();
    const win = $('.windows.dexscreener');
    win.toggleClass('fullscreen-window');
});

function toggleDexscreenerWindow() {
    const win = $('.windows.dexscreener');
    if (dexscreenerWindowOpen) {
        win.css({display: 'none', transform: 'scale3d(0, 0, 1)'});
        dexscreenerWindowOpen = false;
    } else {
        win.css({
            'display': 'block',
            'z-index': 17,
            'transform': 'translate3d(0, 0, 0) scale3d(1, 1, 1)'
        });
        // Set embed iframe src
        const iframe = win.find('#dexscreener-embed iframe');
        iframe.attr('src', 'https://dexscreener.com/solana/JGaCrqMm2JqV9g4wVDiPNr4hDNJny5B6FZb75msjtSC?embed=1&loadChartSettings=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15');
        dexscreenerWindowOpen = true;
    }
}


// ===== README & ROADMAP WINDOWS =====
let readmeWindowOpen = false;
let roadmapWindowOpen = false;

// Icon click handlers (desktop + mobile)
$('[data-w-id="911b49d6-ea40-36b6-c34d-ca2528396137"], [data-w-id="469b9243-b91b-b299-c366-b1c77b889fb6"]').on('click', function(e) {
    e.preventDefault();
    toggleReadmeWindow();
});

$('[data-w-id="44dda0ae-4657-776f-ff2c-fef70cd1018d"], [data-w-id="c60d7db1-6134-d54c-3d18-e573cc915331"]').on('click', function(e) {
    e.preventDefault();
    toggleRoadmapWindow();
});

// Window controls
$(document).on('click', '.windows.readme .close, .windows.readme .minimize', function(e) {
    e.preventDefault();
    $('.windows.readme').css({display: 'none', transform: 'scale3d(0, 0, 1)'});
    readmeWindowOpen = false;
});

$(document).on('click', '.windows.roadmap .close, .windows.roadmap .minimize', function(e) {
    e.preventDefault();
    $('.windows.roadmap').css({display: 'none', transform: 'scale3d(0, 0, 1)'});
    roadmapWindowOpen = false;
});

function toggleReadmeWindow() {
    const win = $('.windows.readme');
    if (readmeWindowOpen) {
        win.css({display: 'none', transform: 'scale3d(0, 0, 1)'});
        readmeWindowOpen = false;
    } else {
        win.css({
            'display': 'block',
            'z-index': 15,
            'transform': 'translate3d(0, 0, 0) scale3d(1, 1, 1)'
        });
        // Load iframe content
        let iframe = win.find('.win-content iframe');
        if (iframe.length === 0) {
            iframe = $('<iframe src="readme/index.html" frameborder="0" style="width:100%; height:100%; border:none; background:#000;"></iframe>');
            win.find('.win-content').html(iframe);
        } else {
            iframe.attr('src', 'readme/index.html');
        }
        readmeWindowOpen = true;
    }
}

function toggleRoadmapWindow() {
    const win = $('.windows.roadmap');
    if (roadmapWindowOpen) {
        win.css({display: 'none', transform: 'scale3d(0, 0, 1)'});
        roadmapWindowOpen = false;
    } else {
        win.css({
            'display': 'block',
            'z-index': 16,
            'transform': 'translate3d(0, 0, 0) scale3d(1, 1, 1)'
        });
        // Load iframe content
        let iframe = win.find('.win-content iframe');
        if (iframe.length === 0) {
            iframe = $('<iframe src="roadmap/index.html" frameborder="0" style="width:100%; height:100%; border:none; background:#000;"></iframe>');
            win.find('.win-content').html(iframe);
        } else {
            iframe.attr('src', 'roadmap/index.html');
        }
        roadmapWindowOpen = true;
    }
}

// Clean up download button on overlay close
    $('#meme-overlay').on('click', function() {
        $('.download-btn').hide();
        $(this).removeClass('has-download').hide();
    });
});




