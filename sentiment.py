import pandas as pd
import ssl
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from tqdm import tqdm

def perform_sentiment_analysis(reviewsArray):

    ssl._create_default_https_context = ssl._create_unverified_context
    
    # create a df with reviews
    df = pd.DataFrame({'review_description': reviewsArray})

    # perform sentiment analysis using VADER model
    nltk.download('vader_lexicon')

    nltk.data.path.append('/Users/mahabayana/nltk_data')
    sia = SentimentIntensityAnalyzer()

    res = {}
    for i, row in tqdm(df.iterrows(), total=len(df)):
        text = row['review_description']
        res[i] = sia.polarity_scores(text)

    vaders = pd.DataFrame(res).T
    vaders = vaders.merge(df, left_index=True, right_index=True)
    vaders['sentiment'] = vaders['compound'].apply(lambda compound: 'Positive' if 0.5 <= compound <= 1.0 else ('Neutral' if -0.5 <= compound < 0.5 else ('Negative' if -1.0 <= compound < -0.5 else 'Unknown')))
    
    return vaders
