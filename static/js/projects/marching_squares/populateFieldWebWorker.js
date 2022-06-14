onmessage = function(e) {
    let data = e.data;
    let out = data + '_populated';
    postMessage(out);
}
