// Requires prototype
// (https://ajax.googleapis.com/ajax/libs/prototype/1.7.1.0/prototype.js)

image_template = "<div class='figure'><a href='#{url}'><img src='#{thumbnail}'></a><div class='caption'>#{caption}</div></div>\n";

function generate_album(data) {
    var content = $("content");
    console.log(content);
    var entries = data.feed.entry;
    console.log("Found entries: ", entries);
    for (var i=0; i < entries.length; i++) {
        var item = entries[i].media$group;
        image = {};

        console.log(item.media$content);
        image.url = item.media$content[0].url;
        thumbnails = item.media$thumbnail;
        image.thumbnail = thumbnails.last().url;
        image.caption = item.media$description.$t;

        console.log("Found image: ", image);
        console.log("Generating HTML: ", image_template.interpolate(image));
        content.innerHTML += image_template.interpolate(image);
    }
}

