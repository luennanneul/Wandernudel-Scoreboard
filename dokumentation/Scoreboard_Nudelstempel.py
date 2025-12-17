def get_data():
    #Scoreboard_Nudelstempel von Lena Buchmann, 2025
    import pandas as pd

    #link_sheet: https://docs.google.com/spreadsheets/d/1FhA-X8jAoMpTy75NShE4ynjL4sKPld-i8Cn2AQiZDIk/edit?gid=0#gid=0
    #A: Stempel; HWN 001-222; B: Lena; C: Thorben; D: Jessie; E: Jan.
    persons = ("Lena", "Thorben", "Jessie", "Jan")
    #initialisierung der dictionaries
    sums = {}
    streaklengths = {} #dictionary nach person: Länge der längsten streak
    streakstarts = {} #dictionary nach person: startstempel der längsten streak
    streakends = {} #dictionary nach person: endstempel der längsten streak
    neg_streaklengths = {} 
    neg_streakstarts = {}
    neg_streakends = {}
    for person in persons:
        sums[person] = 0
        streaklengths[person] = 0 
        streakstarts[person] = 0 
        streakends[person] = 0 
        neg_streaklengths[person] = 0 
        neg_streakstarts[person] = 0 
        neg_streakends[person] = 0 


    #excel tabelle als csv einlesen
    url = "https://docs.google.com/spreadsheets/d/1FhA-X8jAoMpTy75NShE4ynjL4sKPld-i8Cn2AQiZDIk/export?format=csv"
    df = pd.read_csv(url)
    df = df.drop(df.index[-1])

    #wer hat die meisten stempel? -> moststamps (liste)
    summe = 0 
    moststamps=[]
    for person in persons:
        summe_person = int(df.sum()[person])
        if summe_person > summe:
            summe=summe_person
            moststamps=[person]
            #print(moststamps)
        elif summe_person == summe: 
            moststamps.append(person)
            #print(moststamps)
        sums[person] = summe
    #wie viele stempel hat die person mit den meisten stempeln? -> moststampscount (int)
    moststampscount = summe

    #wer hat die längste streak? -> longeststreak (liste)
    #wie lang ist die längste streak? -> longeststreakcount (int)
    longeststreak=[]
    longeststreakcount = 0
    for person in persons:
        streakstart = []
        streakend = []
        streakend_indizes = []
        streakmax = 0
        currentstreak = 0
        for row in df.itertuples():
            value = getattr(row, person)
            if value == 1: 
                currentstreak += 1 #Streak verlängern
            else: #Wenn die Streak abbricht...
                if currentstreak >= streakmax: #... wird geguckt, ob sie länger ist als die alte
                    streakend_index= getattr(row, "Index")-1
                    if currentstreak == streakmax:  #...falls sie gleichlang ist, werden die Endindizes ergänzt
                        streakend_indizes.append(streakend_index)
                        streakend.append(df["Stempel"][streakend_index])
                    else: #...sonst ersetzt.
                        streakend_indizes = [getattr(row, "Index")]
                        streakend = [df["Stempel"][streakend_index]]
                    streakmax = currentstreak
                currentstreak=0
        #print("Streakmax" , person, ":", streakmax)
        index = []
        for element in streakend_indizes:
            i = element-streakmax #Streakende - Streaklänge = Index vom Streakanfang
            index.append(i)
            streakstart.append(df["Stempel"][i]) #Stempelnummer am Streakanfang
        #Für jede Person werden streak Länge, Anfang und Ende in die dictionaries geschrieben
        streaklengths[person] = streakmax 
        streakstarts[person] = streakstart
        streakends[person] = streakend
        #print(person, ":", streakstart, streakend, streakmax)
        
        #Wer hat denn jetzt die längste Streak?
        if streakmax>longeststreakcount:
            longeststreakcount = streakmax
            longeststreak = [person]
        elif streakmax == longeststreakcount:
            longeststreak.append(person)
            

    # Wer hat die längste Neg-Streak? -> longestnegstreak (liste)
    # Wie lang ist die längste Neg-Streak? -> longestnegstreakcount (int)
    longestnegstreak=[]
    longestnegstreakcount = 0
    shortestnegstreak=[]
    shortestnegstreakcount = 222
    negstreakstart = []
    negstreakend = []
    for person in persons:
        negstreakmax = 0
        currentnegstreak = 0
        for row in df.itertuples():
            value = getattr(row, person)
            if value != 1: 
                currentnegstreak += 1 # Streak verlängern
            else: # Wenn die Streak abbricht...
                if currentnegstreak > negstreakmax and currentnegstreak > 0:
                    negstreakend_index = getattr(row, "Index")
                    #print("NegStreakend index:",person, negstreakend_index)
                    negstreakstart_index = negstreakend_index - currentnegstreak 
                    #print("NegStreakstart index:",person, negstreakstart_index)
                    
                    if currentnegstreak == negstreakmax: #... falls sie gleich lang ist:
                        negstreakend.append(df["Stempel"][negstreakend_index-1])
                        negstreakstart.append(df["Stempel"][negstreakstart_index])
                        #print("NegStreakend:", person, negstreakend)
                    else: #neue Streak ist länger
                        negstreakmax = currentnegstreak
                        negstreakend = [df["Stempel"][negstreakend_index-1]]
                        negstreakstart = [df["Stempel"][negstreakstart_index]]  
                        #print("NegStreakend:", person, negstreakend)
                currentnegstreak=0
        #print("NegStreakmax" , person, ":", negstreakmax)
        neg_streaklengths[person] = negstreakmax
        neg_streakstarts[person] = negstreakstart       
        neg_streakends[person] = negstreakend   
        # Wer hat denn jetzt die längste Neg-Streak?
        if negstreakmax>longestnegstreakcount:
            longestnegstreakcount = negstreakmax
            longestnegstreak = [person]     
        elif negstreakmax == longestnegstreakcount:
            longestnegstreak.append(person)
        # Wer hat die kürzeste längste Negative Streak?
        if negstreakmax<shortestnegstreakcount:
            shortestnegstreakcount = negstreakmax
            shortestnegstreak = [person]
        
    return (persons, sums, streaklengths, streakstarts, streakends, neg_streaklengths, neg_streakstarts, neg_streakends, moststamps, moststampscount, longeststreak, longeststreakcount, longestnegstreak, longestnegstreakcount, shortestnegstreak, shortestnegstreakcount)

def print_data():
    (persons, sums, streaklengths, streakstarts, streakends, neg_streaklengths, neg_streakstarts, neg_streakends, moststamps, moststampscount, longeststreak, longeststreakcount, longestnegstreak, longestnegstreakcount, shortestnegstreak, shortestnegstreakcount) = get_data()
    print("Scoreboard:")
    if len(moststamps) > 1:
        if len(moststamps) == 2:
            namen = " und ".join(moststamps)
        else:
            namen = ", ".join(moststamps[:-1]) + " und " + moststamps[-1]
        print(f"Die meisten Stempel haben {namen} mit {moststampscount} Stempeln.")
    else: print(f"Die meisten Stempel hat {moststamps[0]} mit {moststampscount} Stempeln.")

    if len(longeststreak) > 1:
        if len(longeststreak) == 2:
            namen = " und ".join(longeststreak)
        else:
            namen = ", ".join(longeststreak[:-1]) + " und " + longeststreak[-1]
        print(f"Die längste Streak haben {namen} mit {longeststreakcount} Stempeln in Folge.")
    else: print(f"Die längste Streak hat {longeststreak[0]} mit {longeststreakcount} Stempeln in Folge.")   

    if len(longestnegstreak) > 1:
        if len(longestnegstreak) == 2:
            namen = " und ".join(longestnegstreak)
        else:
            namen = ", ".join(longestnegstreak[:-1]) + " und " + longestnegstreak[-1]
        print(f"Die meisten fehlenden Stempel in Folge haben {namen} mit {longestnegstreakcount} fehlenden Stempeln in Folge.")
    else: print(f"Die meisten fehlenden Stempel in Folge hat {longestnegstreak[0]} mit {longestnegstreakcount} fehlenden Stempeln in Folge.") 

    if len(shortestnegstreak) > 1:
        if len(shortestnegstreak) == 2:
            namen = " und ".join(shortestnegstreak)
        else:
            namen = ", ".join(shortestnegstreak[:-1]) + " und " + shortestnegstreak[-1]
        print(f"Die wenigsten fehlenden Stempel in Folge haben {namen} mit maximal {shortestnegstreakcount} fehlenden Stempeln in Folge.")
    else: print(f"Die wenigsten fehlenden Stempel in Folge hat {shortestnegstreak[0]} mit maximal {shortestnegstreakcount} fehlenden Stempeln in Folge.")  
    
    for person in persons:
        zeile = ""
        
        zeile += f"Die längste Streak von {person} ist {streaklengths[person]} Stempel in Folge "
        for i in range(len(streakstarts[person])): 
            zeile += f"von Stempel {streakstarts[person][i]} bis {streakends[person][i]}"
            if i+1 != len(streakstarts[person]):
                zeile += " oder "
            else: zeile+= "."
        print(zeile) 

    for person in persons:
        zeile = ""
        zeile += f"Die längste Neg-Streak von {person} ist {neg_streaklengths[person]} fehlende Stempel in Folge "
        for i in range(len(neg_streakstarts[person])):
            zeile += f"von Stempel {neg_streakstarts[person][i]} bis {neg_streakends[person][i]}"
            if i+1 != len(neg_streakstarts[person]):
                zeile += " oder "
            else: zeile+= "."
        print(zeile)


if __name__== "__main__":
    print_data()
 
# person auswählen und gucken: 
    #was ist ihr max, ihre längste streak, ihre längste neg streak. 
# funktionen schreiben: get_data(), returns:

# sums = {x}
# streaklengths = {x} 
# streakstarts = {x}
# streakends = {x}
# neg_streaklengths = {x} 
# neg_streakstarts = {x}
# neg_streakends = {x}
# moststamps = [x]
# longeststreak=[x]
# longeststreakcount = x
# longestnegstreak=[x]
# longestnegstreakcount = x
# shortestnegstreak=[x]
# shortestnegstreakcount = x
# negstreakstart = [x]
# negstreakend = [x]

#app schreiben

   