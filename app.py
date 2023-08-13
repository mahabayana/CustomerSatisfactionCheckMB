from flask import Flask, render_template, request, jsonify, send_file
import json
import subprocess
import os
import base64
import tempfile
import numpy as np
from PIL import Image
from wordcloud import WordCloud, STOPWORDS

from sentiment import perform_sentiment_analysis

app = Flask('Customer Satisfaction Check')

# directory for temporary files 
TEMP_DIR = tempfile.mkdtemp()

def generate_wordcloud(text):
    try:
        # idenitfy the STOP WORDS for removal
        stopwords = set(STOPWORDS)

        wc = WordCloud(
            background_color="white",
            max_words=200,
            stopwords=stopwords,
        )

        wc.generate(text)

        # save the wordCloud image in world.png in static
        wordcloud_filename = os.path.join(TEMP_DIR, "wordcloud.png")
        wc.to_file(wordcloud_filename)

        return wordcloud_filename
    except Exception as e:
        print("Error generating word cloud:", e)
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/perform_sentiment_analysis', methods=['POST'])
def analyze_sentiment():
    data = request.get_json()
    reviews = data['reviews']

    # perform sentiment analysis 
    sentiment_analysis_result = perform_sentiment_analysis(reviews)

    sentiment_counts = sentiment_analysis_result['sentiment'].value_counts().to_dict()

    response_data = {
        "sentiment_counts": sentiment_counts
    }

    return jsonify(response_data)

@app.route('/generate_wordcloud', methods=['POST'])
def generate_wordcloud_endpoint():
    try:
        data = request.get_json()
        reviews_text = data['reviews']

        # generate wordCloud image
        wordcloud_filename = generate_wordcloud(reviews_text)

        if wordcloud_filename:
            # read the generated wordCloud image
            with open(wordcloud_filename, 'rb') as f:
                wordcloud_base64 = base64.b64encode(f.read()).decode('utf-8')

            # return the wordCloud image
            response_data = {
                "wordcloud_base64": wordcloud_base64
            }

            return jsonify(response_data)
        else:
            return jsonify({"error": "Failed to generate word cloud."}), 500
    except Exception as e:
        print("Error generating word cloud:", e)
        return jsonify({"error": "Failed to generate word cloud."}), 500

@app.route('/wordcloud_image')
def serve_wordcloud_image():
    try:
        wordcloud_filename = os.path.join(TEMP_DIR, "wordcloud.png")
        return send_file(wordcloud_filename, mimetype='image/png')
    except Exception as e:
        print("Error serving word cloud image:", e)
        return jsonify({"error": "Failed to serve word cloud image."}), 500

if __name__ == '__main__':
    app.run(debug=True)
