'use strict';

const response500 = `<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <title>Error 500 Server Error</title>
</head>

<body>
    <h2>HTTP ERROR 500</h2>
    <p>Problem accessing /api/message/. Reason:
        <pre>Server Error</pre>
    </p>
    <h3>Caused by:</h3>
    <pre>javax.servlet.ServletException: javax.servlet.ServletException: org.apache.activemq.web.NoDestinationSuppliedException: Could not perform the JMS operation as no Destination was supplied
        at org.eclipse.jetty.server.handler.HandlerCollection.handle(HandlerCollection.java:168)
        at org.eclipse.jetty.server.handler.HandlerWrapper.handle(HandlerWrapper.java:132)
        at org.eclipse.jetty.util.thread.QueuedThreadPool.runJob(QueuedThreadPool.java:781)
        at org.eclipse.jetty.util.thread.QueuedThreadPool$Runner.run(QueuedThreadPool.java:917)
        at java.lang.Thread.run(Thread.java:748)
    Caused by: javax.servlet.ServletException: org.apache.activemq.web.NoDestinationSuppliedException: Could not perform the JMS operation as no Destination was supplied
        at org.eclipse.jetty.server.handler.HandlerCollection.handle(HandlerCollection.java:168)
        at org.eclipse.jetty.security.SecurityHandler.handle(SecurityHandler.java:513)
        at org.eclipse.jetty.server.handler.HandlerCollection.handle(HandlerCollection.java:152)
        ... 19 more
    </pre>
    <hr>
    <a href="http://eclipse.org/jetty">Powered by Jetty:// 9.4.19.v20190610</a>
    <hr />
</body>
</html>`;

const responseSuccess = 'Message sent';

jest.doMock('../request/index.js', () =>
    jest.fn(() => ({
        post: options => {
            if (!options.url.endsWith('SubmissionsQueue')) {
                return response500;
            }
            return responseSuccess;
        }
    }))
);

const createMessageBusCaller = require('./index');

describe('Message Bus', () => {
    describe('POST', () => {
        const messageBus = createMessageBusCaller({
            logger: {
                info: () => {}
            }
        });
        it('should return a success', async () => {
            const result = await messageBus.post('SubmissionsQueue', {
                applicationId: 'questionnaireId'
            });
            console.log(result.toString());
            expect(result).toEqual(responseSuccess);
        });

        it('should return an error', async () => {
            const result = await messageBus.post(undefined, {
                applicationId: 'questionnaireId'
            });
            expect(result).toEqual(response500);
        });
    });
});
