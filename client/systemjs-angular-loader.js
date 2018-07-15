let templateUrlRegex = /templateUrl\s*:(\s*['"`](.*?)['"`]\s*)/gm
let stylesRegex = /styleUrls *:(\s*\[[^\]]*?\])/g
let stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g

module.exports.translate = function(load){
    if(load.source.includes('moduleId'))
        return load

    let url = document.createElement('a')
    url.href = load.address

    let basePathParts = url.pathname.split('/')
    basePathParts.pop()
    let basePath = basePathParts.join('/').slice(1)

    load.source = load.source
        .replace(templateUrlRegex, function(match, quote, url){
            let resolvedUrl = basePath + "/" + url
            return 'templateUrl: "' + resolvedUrl + '"'
        })
        .replace(stylesRegex, function(match, relativeUrls) {
            let urls = []
            while((match = stringRegex.exec(relativeUrls)) !== null)
                urls.push('"' + basePath + "/" + match[2] + '"')

            return "styleUrls: [" + urls.join(', ') + "]"
        })

    return load
}