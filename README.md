# Hitch #
6.170 Group Project with Eric Chen, Selina Leung, and Teresa Tai
Deployed at https://hitch-6170.herokuapp.com/  

## Overview ##
Hitch is an app that allows users to find other people who are looking to share rides to and from the same locations up to 2 weeks in the future.  

## Purpose ##
Oftentimes one knows about a ride that he/she will need in advance and would like to schedule a carpool to save money. Currently, there is no existing convenient method to reach out to people whom you may not necessarily know to schedule these rides. Hitch fills this gap by providing an easy-to-use interface for users to find others to carpool with.  

## Creating and Joining Rides ##
After registering and logging into our app, users will be able to view a list of open rides. If a desired ride already exists, the user can decide to join that ride provided there is remaining capacity. Alternatively, they are able to create a new ride. If a user decides to create a ride, they are required to input a departure date and time, start location, destination, ride capacity, and means of transportation. Hitch currently allows users to share Uber, Lyft, and taxi rides.  

## Managing Your Rides ##
Each user has a “My Rides” page on which they are able to view and manage rides they are a part of. From this list of rides, they can click to access the ride page and view detailed information about the ride. They can leave any upcoming rides they are currently participating in, or leave reviews for other riders they have shared rides with. If the creator of a ride feels that someone who joined their ride has too low a rating, the creator is able to remove that user from their ride.  

## Accountability through Reviews ##
After a ride has been completed, each user has the option to review each of the other passengers in that shared ride. A review consists of a rating from one star to five stars as well as an optional comment. This helps ensures that future rides are shared between reliable riders. Users can click on a username in a ride to view the reviews that the other user has received in the past.  

## Design Decisions and Constraints ##
There are certain design and constraint decisions we made:  
* Users
 * A user has a star rating between 1 and 5, which is an average of all the ratings in the reviews they have received from past rides.
 * A user starts off with a rating of 5 stars.
* Rides
 * Users cannot change the details of a ride once it has been created. This was chosen to ensure commitment to rides and prevent users from ruining other riders’ plans.
 * Rides may only be scheduled up to 2 weeks in advance. By restricting the time period, we reduce the likelihood that a user forgets about their ride.
 * Rides may only contain 2-6 people. The minimum limit is to enforce the ride sharing aspect of Hitch, and the maximum limit is the typical capacity of taxis, Uber, and Lyft vehicles.
 * If all users leave a ride, that ride is deleted from our database.
 * The creator of a ride can remove other users from that ride. If the creator leaves the ride, then nobody has the ability to remove other users from the ride.
* Reviews
 * A user can leave a review for another user they have shared a ride with. That review is associated not only with the reviewer and reviewee, but also that specific ride.
 * Once a review is posted, it cannot be edited.
