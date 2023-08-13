document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitBtn");
  const calculateBtn = document.getElementById("calculateBtn");
  const reviewsTextarea = document.getElementById("reviewsTextarea");
  const reviewsList = document.getElementById("reviewsList");
  const chartContainer = document.getElementById("satisfactionChart"); 
  const showBtn = document.getElementById("showBtn");

  // create flag to ensure pie chart is only created once
  let pieChartCreated = false;

  submitBtn.addEventListener("click", async function () {
    const reviewsText = reviewsTextarea.value;
    const reviewsArray = reviewsText.split("\n\n");

    reviewsList.innerHTML = "";

    reviewsArray.forEach(function (review) {
      const li = document.createElement("li");
      li.textContent = review;
      reviewsList.appendChild(li);
    });

    // store the reviewsArray
    reviewsList.setAttribute("data-reviews", JSON.stringify(reviewsArray));
  });

  calculateBtn.addEventListener("click", async function () {
    try {
      // retrieve reviewsArray from the data attribute
      const reviewsArray = JSON.parse(reviewsList.getAttribute("data-reviews"));

      // fetch sentiment analysis and display pie chart
      const sentimentData = await fetchAndDisplaySentimentAnalysis(reviewsArray);
      console.log("Sentiment data received:", sentimentData); 

      // check if sentiment data has expected structure with sentiment_counts key
      if ("sentiment_counts" in sentimentData) {
        createPieChart(sentimentData.sentiment_counts);
      } else {
        console.error('Sentiment counts are missing in the received data:', sentimentData);
      }
    } catch (error) {
      console.error("Error in sentiment analysis:", error);
    }
  });

  showBtn.addEventListener("click", async function () {
    try {
      const reviewsArray = JSON.parse(reviewsList.getAttribute("data-reviews"));
      createWordCloud(reviewsArray);
    } catch (error) {
      console.error("Error in show button:", error);
    }
  });

  async function fetchAndDisplaySentimentAnalysis(reviewsArray) {
    try {
      const response = await fetch('/perform_sentiment_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviews: reviewsArray }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const sentimentData = await response.json();
      console.log('Received sentiment data:', sentimentData);

      return sentimentData;
    } catch (error) {
      console.error('Error fetching sentiment analysis:', error);
      throw error; 
    }
  }

  function createPieChart(sentimentCountsData) {
    try {
      if (!pieChartCreated) {
        // check if sentimentCountsData is valid
        if (sentimentCountsData && typeof sentimentCountsData === "object") {
          console.log("Creating pie chart...");

          console.log("Received sentiment counts:", sentimentCountsData);

          if (chartContainer) {
            const labels = Object.keys(sentimentCountsData);
            const data = Object.values(sentimentCountsData);

            // create pie chart
            const pieChart = new Chart(chartContainer, {
              type: "pie",
              data: {
                labels: labels,
                datasets: [
                  {
                    data: data,
                    backgroundColor: ["pink", "teal", "purple"],
                  },
                ],
              },
              options: {
                title: {
                  display: true,
                  text: "Overall Customer Satisfaction",
                },
              },
            });

            // set flag to indicate that chart has been created
            pieChartCreated = true;
          } else {
            console.error("Chart container element not found.");
          }
        } else {
          console.error("Invalid sentiment counts data:", sentimentCountsData);
        }
      } else {
        console.log("Pie chart already created.");
      }
    } catch (error) {
      console.error("Error creating pie chart:", error);
    }
  }

  function createWordCloud(reviewsArray) {
    if (typeof WordCloud !== "undefined") {
      try {
        console.log("Creating word cloud...");
  
        // convert array of reviews into a single string
        const reviewsText = reviewsArray.join(" ");
  
        // pass the reviews text to the server to create the wordCloud
        fetch("/createWordCloud", {
          method: "POST",
          body: JSON.stringify({ text: reviewsText }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            const wordCloudImageURL = data.imageURL;
  
            // display the wordCloud image
            const wordCloudImage = document.getElementById("wordCloudImage");
            wordCloudImage.src = wordCloudImageURL;
  
            console.log("Word cloud created.");
          })
          .catch((error) => {
            console.error("Error creating word cloud:", error);
          });
      } catch (error) {
        console.error("Error creating word cloud:", error);
      }
    } else {
      console.error("WordCloud library not loaded.");
    }
  }


});
