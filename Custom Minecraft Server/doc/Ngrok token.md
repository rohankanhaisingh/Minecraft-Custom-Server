# Ngrok Token

- - -

To host your dedicated server **without** forwarding your IP, you'll need to use Ngrok.

With Ngrok, you can hide your public IP address, and will use the Ngrok one instead. An Ngrok IP is
a array of letters and symbols with a Ngrok domain at the end. 

**Note: the IP will change everytime you close your server. It will not stay forever**.

- - - 


## Getting started.

1. Head over to https://ngrok.com/ and login or sign-up using any available 2fa platform. Ngrok has three plans,
for this you will need the free plan. The free plan allows you to have 60 connections each minute. 

2. Once you signed up, go to the dashboard and copy your authtoken. You'll need this authtoken
to get access to the Ngrok API.

3. Head back to the application where you have to setup your server, and paste the authtoken in the right
inputfield 'Ngrok token'.

## Troubleshooting

Frequently asked questions about the Ngrok token.

- - - 

#### What to do if I don't want to use Ngrok, and use my IP instead.

At the moment (version 0.1.0 - 0.2.0), the application has **no support** for ip-forwarded Minecraft servers. 
I will try to implement the support for ip-forwarded servers as soon as I can.

- - -

#### Is there a rate-limit.

Yes and no. 

It is a tough work to track rate-limits in Ngrok. If you start and close a Ngrok service many times in a few minutes,
it won't work for a little while. I have seen this happening many times when building the application.

Just try to use as less as you can.

- - -

#### Will Ngrok monitor my network information.

No.

I've been using Ngrok for a long, long, long time and it's such a great service. It's easy to use and
has great support for a lot of things. Think as host support for TCP, TCL and HTTP services.

They give developers all the things they need to distrubute applications such as this one, the custom
Minecraft server application.

They work really safe and secure all the data they have access to.