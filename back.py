from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import json
from youtube_transcript_api import YouTubeTranscriptApi
import os
from googletrans import Translator

translator = Translator()

client_id = "client_id"
client_secret = "client_secret"

app = Flask(__name__)
CORS(app)

# Google OAuth 2.0 client configuration
CLIENT_ID = client_id
CLIENT_SECRET = client_secret
REDIRECT_URI = 'postmessage'
URI = "https://oauth2.googleapis.com/token"
app = Flask(__name__)
CORS(app)

app = Flask(__name__)
CORS(app)

@app.route('/playlist', methods=['POST'])
def google_auth():
    code = request.json.get('code')
    if not code:
        return jsonify({'error': 'Authorization code is missing'}), 400
    print(1)

    token_url = 'https://oauth2.googleapis.com/token'
    token_data = {
        'code': code,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'grant_type': 'authorization_code',
    }
    print(2)
    token_response = requests.post(token_url, data=token_data)
    token_json = token_response.json()
    print("3 : ", token_json)

    with open('credential.json', 'w') as f:
        json.dump(token_json, f, indent=4)
    # Check for errors in the token response
    if 'error' in token_json:
        return jsonify({'error': token_json['error']}), 400
    print(4)

    # Extract refresh token
    refresh_token = token_json.get('refresh_token')
    access_token = token_json.get('access_token')
    if not refresh_token:
        return jsonify({'error': 'Refresh token not found'}), 400

    try:
        credentials = Credentials(refresh_token=refresh_token, client_id=CLIENT_ID, client_secret=CLIENT_SECRET,
                                  token_uri=URI, token=access_token)
        youtube = build('youtube', 'v3', credentials=credentials)
        request_ = youtube.playlists().list(
            part='snippet',
            mine=True
        )
        response = request_.execute()


        with open('playlist.json', 'w') as f:
            json.dump(response, f, indent=4)
        return jsonify(response), 200
    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'error: ', str(e)}), 500


@app.route('/item', methods=['POST'])
def get_playlist_item():
    print("get_playlist_item: ", get_playlist_item)
    playlistId = request.json.get('playlistId')
    try:
        with open('credential.json', 'r') as f:
            data = json.load(f)

        credentials = Credentials(refresh_token=data['refresh_token'], client_id=client_id, client_secret=client_secret,
                                  token_uri=URI, token=data['access_token'])
        youtube = build('youtube', 'v3', credentials=credentials)
        request_ = youtube.playlistItems().list(
            part='snippet',
            playlistId=playlistId,
        )
        response = request_.execute()
        with open('playlistitem.json', 'w') as f:
            json.dump(response, f, indent=4)

        return jsonify(response), 200
    except Exception as e:
        print('error: ', str(e))
        return jsonify({'error: ', str(e)}), 500


@app.route('/transcript_json', methods=['POST'])
def get_transcript():
    video_id = request.json.get('receivedVideoId')

    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

    try:
        transcript = transcript_list.find_manually_created_transcript(['en'])
    except Exception as e:
        try:
            transcript = transcript_list.find_generated_transcript(['en'])
        except Exception as e:
            return jsonify({'error': 'Transcript not found'}), 404

    try:
        with open(f'./back_folder/transcript/{video_id}.json', 'w') as f:
            json.dump(transcript.fetch(), f, indent=4)

        with open(f'./back_folder/transcript/{video_id}.json', 'r') as f:
            data = json.load(f)

        return jsonify(data)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch transcript'}), 500

@app.route('/translate_word', methods=['POST'])
def translate_word():
    try:
        data = request.json
        word = data.get('word')
        print(f"data: {data}, word: {word}")
        translated = translator.translate(word, dest='ko')
        print(f"translated: {translated.text}")
        return jsonify({'translated_word': translated.text})
    except Exception as e:
        print("translate_word error: ", e)

@app.route('/word', methods=['POST'])
def receive_word():
    data = request.json
    word = data.get('word')
    video_id = data.get('videoId')
    text_index = data.get('textIndex')
    text_start_time = data.get('textStartTime')
    translated_word = data.get('translatedWord')
    print("receive_word(): ", data)

    try:
        with open('./back_folder/words/words.json', 'r') as f:
            words_json = json.load(f)
        print(1)
        if word in words_json:
            words_json[word].append({"video_id": video_id, "text_index": text_index, "text_start_time": text_start_time})
            print(2)
        else:
            words_json[word] = [{"video_id": video_id, "text_index": text_index, "text_start_time": text_start_time,
                                 "translated_word": translated_word}]
            print(3)
        print(4)
        with open('./back_folder/words/words.json', 'w') as f:
            json.dump(words_json, f, indent=4)
    except Exception as e:
        print("save_word error: ", e)
    return '', 204


@app.route('/get_word_json', methods=['GET'])
def get_word_json():
    with open('./back_folder/words/words.json', 'r') as f:
        words_json = json.load(f)
    return jsonify(words_json)

@app.route('/post_transcript', methods=['POST'])
def post_transcript():
    video_id = request.json.get('videoId')
    with open(f'./back_folder/transcript/{video_id}.json', 'r') as f:
        data = json.load(f)
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)


