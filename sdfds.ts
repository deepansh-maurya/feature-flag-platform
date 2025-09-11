const generateCuratedPlaylistShareGraphicImage = async (playlist: any, order: number) => {
    try {
        const templatePath = ./assets/curatedPlaylistShareGraphicsFrame.webp;
        const mediaDetail = await getMediaDetailsByMediaId(playlist.coverMediaId, 'default');
        const s3FileKey = mediaDetail.storageRelativePath;
        const thumbnailImagePath = /tmp/${mediaDetail.mediaId}_${generateAlphaNumericId(4)}.${mediaDetail.fileExtension};
        const s3Client = getS3Client();
        await downloadFileFromS3(s3Client, process.env.S3_BUCKET_NAME, s3FileKey, thumbnailImagePath);
        const title = playlist.title || '';

        // get template dimensions so we size everything to fit
        const templateMetadata = await sharp(templatePath).metadata();
        if (!templateMetadata.width || !templateMetadata.height) {
            throw new Error('Could not get template image dimensions');
        }
        const templateWidth = templateMetadata.width;
        const templateHeight = templateMetadata.height;

        const maxTextWidth = templateWidth;
        const titleLineHeight = 67.2;

        // Define the canvas and font to measure text
        const canvas = createCanvas(1, 1);
        const ctx = canvas.getContext('2d');
        ctx.font = '56px Noto Sans Bold, Noto Sans Tamil, Noto Sans Kannada Bold, Noto Sans Telugu, Noto Sans Malayalam, Noto Sans Devanagari'; // Set the font to be used for text measurement

        // Cast the context explicitly to the correct type
        const ctxTyped = ctx as unknown as CanvasRenderingContext2D;
        // Split the text into lines using the updated function
        const titleLines = splitTextToLines(title, maxTextWidth, ctxTyped);



        // build the SVG that contains the title and creator text (centered horizontally inside full canvas)
        // We offset x to center within full template width, but measuring uses frostedRectWidth so lines will wrap properly.
        const textSvg = `
            <svg width="${templateWidth}" height="${templateHeight}" xmlns="http://www.w3.org/2000/svg">
                <style>
                    .title {
                        fill: #FFFFFF;
                        font-size: 56px;
                        font-family: 'Noto Sans', Noto Sans Tamil, Noto Sans Kannada Bold, Noto Sans Telugu, Noto Sans Malayalam, Noto Sans Devanagari, Noto Emoji;
                        font-weight: 700;
                        text-anchor: middle;
                        dominant-baseline: hanging;
                        letter-spacing: -1.12px;
                        font-feature-settings: 'liga' off, 'clig' off;
                    }
                </style>
                ${titleLines.map((line, index) =>
            <text x="${templateWidth/2}" y="${(index + 1) * titleLineHeight}" class="title">${cleanXmlString(line)}</text>
        ).join('')}
            </svg>
        `;

        const thumbnailRadius = 350; // width and height of circle should be 700px (radius*2)
        // Calculate the center position of the thumbnail
        const circleX = Math.floor(-0.02);
        const circleY = 0;
        const background = await sharp({
            create: {
                width: templateWidth,
                height: templateHeight,
                channels: 4, // RGBA for transparency
                background: convertColorToRGBA('#FFFCEO'),
            },
        })
        .webp() 
        .toBuffer();

        const resizedThumbnailImage = await sharp(thumbnailImagePath)
            .resize(700, 700)
            .toBuffer();
        const roundedRectMask = Buffer.from(
            `<svg width="700" height="700" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="700" height="700" rx="25" ry="25" fill="white"/>
            </svg>`
        );

        const thumbnail = await sharp(resizedThumbnailImage)
            .extract({
            left: 0,
            top: 0,
            width: thumbnailRadius * 2,
            height: thumbnailRadius * 2,
            }) // Crop to the desired circle area
            .composite([
            {
                input: roundedRectMask,
                blend: "dest-in", // Apply circular transparency
            },
            ])
            .webp()
            .toBuffer();

        const finalImageBuffer = await sharp(background)
          .composite([
            { input: templatePath, top: 0, left: 0, gravity: 'centre', blend: 'over' },
            { input: Buffer.from(textSvg), top: 794, left: 0, blend: 'over' }, //  top: 794.02
            { input: thumbnail, top: circleY, left: circleX, blend: 'over' },
          ])
          .webp()
          .toBuffer();



          
          
        const fileExtension = 'webp';
        const contentType = 'image/webp';
        const shareGraphicMediaId = generateAlphaNumericId(20);
        const dbClient = getDBclient();
        const mediaObject: MediaV2 = {
            mediaId: shareGraphicMediaId,
            variantName: 'default',
            cdnProvider: 'cloudfront',
            cdnRelativePath: CuratedPlaylistShareGraphic/${shareGraphicMediaId}.${fileExtension},
            createdOn: getCurrentEpochTimestamp(),
            entityType: 'curatedPlaylist',
            fileExtension: .${fileExtension},
            fileName: ${shareGraphicMediaId}.${fileExtension},
            lastModifiedOn: getCurrentEpochTimestamp(),
            storageProvider: 's3',
            mediaSize: finalImageBuffer.length,
            mediaStatus: 'live',
            mediaType: contentType,
            storageRelativePath: CuratedPlaylistShareGraphic/${shareGraphicMediaId}.${fileExtension},
            userId: ""
        };

        const params: PutItemCommandInput = {
            TableName: process.env.AllMediaTableV2,
            Item: marshall(mediaObject) as any
        };
        await dbClient.send(
            new PutItemCommand(params)
        );
        await uploadStreamBufferToS3(s3Client, process.env.S3_BUCKET_NAME, mediaObject.storageRelativePath, contentType, finalImageBuffer);

        // Update the curated playlist with the new shareGraphic
        const updateParams: UpdateItemCommandInput = {
            TableName: process.env.FeedSectionPlaylistsTable,
            Key: {
                playlistId: { S: playlist.playlistId },
                order: { N: order.toString() }
            },
            UpdateExpression: 'SET shareGraphicMediaId = :shareGraphicMediaId',
            ExpressionAttributeValues: marshall({ ':shareGraphicMediaId': shareGraphicMediaId })
        };

        await dbClient.send(
            new UpdateItemCommand(updateParams)
        );

    } catch (err) {
        logError(err.message || String(err), 'errorWhileGenratingCuratedPlaylistShareGraphic', 5, err, playlist);
    }
}