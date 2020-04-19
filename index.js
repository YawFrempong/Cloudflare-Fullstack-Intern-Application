class ElementHandler {    //class for changing elements in the HTML
  element(element) {
    let element_tag = element.tagName
    switch (element_tag) {
      case "title":           
        element.setInnerContent("Yaw's Custom Cloudflare Page")   //replace value
        break;
      case "h1":              //heading 1
      element.setInnerContent("My Serverless Slackbot Powered by Kubernetes") //replace value
        break;
      case "p":               //"p" is description
        element.append("I should use Cloudflare for my next Slackbot project....")  //add to existing value
        break;
      case "a":               //"a" is url
        const git_url = "https://github.com/YawFrempong/Google-Sheets-Trello-Slack-Bot"
        element.setAttribute("href", git_url);
        element.setInnerContent("My Slackbot");
        break;
    }
  }
}

const website_url = 'https://cfw-takehome.developers.workers.dev/api/variants'
const type = 'application/json;charset=UTF-8'

function findCookie(info, id){            //seach for the cookie we added to the array of cookies in the page document(document.cookie)
  if(info){
    let cookie_arr = info.split(";");   //delimiter in array of cookies
    for (i = 0; i < cookie_arr.length; i++) {
        let properties = cookie_arr[i].split("=");    //"variable_name=value" -> ['variable_name', 'value']
        let name = properties[0]                      
        if (name === id) {                            //if the name of the cookie we added to the arrau is found get it's value
          let name_val = properties[1]                //"variant=https://cfw-takehome.developers.workers.dev/api/variants/1 or https://cfw-takehome.developers.workers.dev/api/variants/2"
            return name_val;
        }
    }
  }
  return null
}

async function gatherResponse(response) {         //formats multiple types of responses
  const { headers } = response
  const contentType = headers.get('content-type')
  if (contentType.includes('application/json')) {
    return await response.json()
  } else if (contentType.includes('application/text')) {
    return await response.text()
  } else if (contentType.includes('text/html')) {
    return await response.text()
  } else {
    return await response.text()
  }
}

async function handleRequest(request) {
  const init = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }
  const response = await fetch(website_url, init)   //fetch response from url & wait until the value is load. 
  const result = await gatherResponse(response) //format reponse & wait until the value is load
  const cookie_info = request.headers.get("Cookie");  //get array of cookies from document
  const cookie = findCookie(cookie_info, "variant")   //passed in: array of current cookies, name of the cookie we added
  let random_url = ''
  if(cookie != null){   //if cookie exist, don't randomly choose a variant; use the variant stored in the cookie.
    random_url = cookie
  }
  else{ //if cookie doesn't exist(first time the page loads) randomly pick a variant
    const variants = result.variants
    const random_val = Math.random()
    if(random_val <= 0.5) { 
      random_url = variants[0] 
    } else {
      random_url = variants[1] 
    }
  }
  const random_response = await fetch(random_url) //fetch response of randomly chosen variant
  const customizer = new HTMLRewriter().on("title", new ElementHandler()).on("h1#title", new ElementHandler()).on("p#description", new ElementHandler()).on("a#url", new ElementHandler()) //initialize the custom HTML
  const custom_response = customizer.transform(random_response) //edit the HTML with custom input
  if(cookie == null){ //if cookie doesn't exist(first time the page loads) make one
    const cookie_init = `variant=${random_url}`
    custom_response.headers.set('Set-Cookie', cookie_init)
  }
  return custom_response
}

addEventListener('fetch', event => {                      //listen for incoming request from client
  return event.respondWith(handleRequest(event.request))
})