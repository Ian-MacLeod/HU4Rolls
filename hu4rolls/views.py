from hu4rolls import app


@app.route('/')
def root():
    return app.send_static_file('index.html')
