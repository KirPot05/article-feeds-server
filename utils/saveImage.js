export function saveImage(article, articleEncoded){

    if(articleEncoded == null) return;

    const imageTypes = ['image/jpeg', 'image/png', 'image/gif']
    const cover = JSON.parse(articleEncoded);

    if(cover != null && imageTypes.includes(cover.type)){
        article.articleImg = new Buffer.from(cover.data, 'base64');
        article.articleImgType = cover.type;
    }

    return article;
}