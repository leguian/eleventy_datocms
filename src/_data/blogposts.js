// required packages
const fetch = require("node-fetch");

// DatoCMS token
const token = process.env.DATOCMS_TOKEN;

// get blogposts
// see https://www.datocms.com/docs/content-delivery-api/first-request#vanilla-js-example
async function getAllBlogposts() {

  // do we make a query ?
  let makeNewQuery = true;

  // Blogposts array
  let blogposts = [];

  // make queries until makeNewQuery is set to false
    try {
      // initiate fetch
      const dato = await fetch("https://graphql.datocms.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
          {
            _allArticlesMeta {
              count
            }
            allArticles {
              _status
              _firstPublishedAt
              id
              _allTitleLocales {
                locale
                value
              }
              _allBodyLocales(markdown: true) {
                locale
                value
              }
              image {
                id
                alt
                url
              }
              _allSlugLocales {
                locale
                value
              }
              categorie {
                _allTitleLocales {
                  locale
                  value
                }
              }
            }
          }
          `,
        }),
      });

      // store the JSON response when promise resolves
      const response = await dato.json();

      console.log(response);

      // handle DatoCMS errors
      if (response.errors) {
        let errors = response.errors;
        errors.map((error) => {
          console.log(error.message);
        });
        throw new Error("Aborting: DatoCMS errors");
      }

      // update blogpost array with the data from the JSON response
      blogposts = blogposts.concat(response.data.allArticles);

    } catch (error) {
      throw new Error(error);
    }

  // console.log(blogposts);

  // format blogposts objects
  const blogpostsFormatted = blogposts.map((item) => {
    return {
      id: item.id,
      title: item._allTitleLocales,
      publishedDate: item._firstPublishedAt,
      slug: item._allSlugLocales.value,
      thumb: item.image.url,
      thumbAlt: item.image.alt,
    };
  });

  // return formatted blogposts
  return blogpostsFormatted;
}

// export for 11ty
module.exports = getAllBlogposts;
