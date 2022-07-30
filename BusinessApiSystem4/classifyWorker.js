const sharp = require('sharp')

const { connectToDb } = require('./lib/mongo')
const { connectToRabbitMQ, getChannel } = require('./lib/rabbitmq')

const {
    getDownloadStreamById,
    updateThumbsTagsById,
    saveThumbFile
} = require('./models/photo')

const queue = 'images'


/*
    get id
    create thumbnail
    store into thumbs
    send thumbId
    /media/thumbs/{id}.jpg to download
*/

connectToDb( async()=> {

    await connectToRabbitMQ(queue)
    const channel = getChannel()
    channel.consume(queue, async function (msg) {
        if (msg) {
            const id = msg.content.toString()
            // take image
            const downloadStream = getDownloadStreamById(id)

            const imageData = []
            downloadStream.on('data', function (data) {
                imageData.push(data)
            }).on('end', async function () {
                //console.log(Buffer.concat(imageData))
                // store thumb

                thumbId = await saveThumbFile(Buffer.concat(imageData))
                console.log("== thumbId",thumbId)
                // add thumbs id
                await updateThumbsTagsById(id, thumbId)
            })
        }
        channel.ack(msg)
    })
})