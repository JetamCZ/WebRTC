const socket = io('/')

let peers = []

const peer = new Peer()

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
    console.log('MY-ID', id)
})

const getUserMedia = navigator.mediaDevices.getUserMedia

getUserMedia({audio: true, video: true})
    .then((myStream) => {
        const video = document.createElement('video')
        video.muted = true
        addVideoStream(video, myStream)

        document.getElementById("error").innerText = "GOT video";
    })
    .catch(e => {
        console.log(e)
        document.getElementById("error").innerText = e.message;
    })

//Make call to new users
socket.on('user-connected', strangerId => {
    console.log('NEW USER - '+strangerId)

    getUserMedia({video: true, audio: true})
        .then((myStream) => {
            let call = peer.call(strangerId, myStream);

            callManager(call)
        })
})

socket.on('user-disconnected', (strangerId) => {
    console.log('DIS', strangerId)
    const peer = peers.find(p => p.id === strangerId)

    if(peer) {
        peer.video.remove()
    }

    peers = peers.filter(p => p.id !== strangerId)
})

peer.on('call', (call) => {
    console.log('Incoming call')

    getUserMedia({video: true, audio: true})
        .then((myStream) => {
            call.answer(myStream);

            callManager(call)
        })

})

function callManager(call) {
    const video = document.createElement('video')

    call.on('stream', (remoteStream) => {
        console.log('Incoming call - new stream', call)

        if(!peers.find(peer => peer.id === call.peer)) {
            addVideoStream(video, remoteStream)
            console.log('Video added')
        }

        peers.push({id: call.peer, video})
    });
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    document.getElementById('video-grid').append(video)

    return video
}