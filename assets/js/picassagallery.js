// Picassa gallery viewer code thingie made by Micha Gorelick
// (http://micha.gd/)
//
// Requires prototype
// (https://ajax.googleapis.com/ajax/libs/prototype/1.7.1.0/prototype.js)

image_template = "<div class='figure'><a href='#{url}'><img src='#{thumbnail}'></a><div class='caption'>#{caption}</div></div>\n";

video_template = '<div class="figure"><video controls preload="metadata" src="#{url}"><a href="#{url}"><img src="#{thumbnail}"></a></video><div class="caption">#{caption} [video]</div></div>\n';

function generate_album(data) {
    var content = $("content");
    var entries = data.feed.entry;
    for (var i=0; i < entries.length; i++) {
        var values = {};
        var item = entries[i].media$group;
        var mediacontent = item.media$content.last();
        var thumbnails = item.media$thumbnail.last();

        values.url = mediacontent.url;
        values.thumbnail = thumbnails.url;
        values.caption = item.media$description.$t;

        if (mediacontent.medium == "video") {
            content.innerHTML += video_template.interpolate(values);
        } else if (mediacontent.medium == "image") {
            content.innerHTML += image_template.interpolate(values);
        }
    }
}

