#include<iostream>
#include<vector>
using namespace std;
bool isValidAnagram(string s,string t){
    if(s.size()!=t.size()) return false;
    unordered_map<char,int>mp1;
    unordered_map<char,int>mp2;
    for(char ch: s){
        mp1[ch]++;
    }
    for(char ch: t){
        mp2[ch]++;
    }
    for(auto it: mp1){
        char ch = it.first;
        int freq = it.second;
        if(mp2.find(ch)==mp2.end()) return false;
        int freq2 = mp2[ch];
        if(freq!=freq2) return false;
    }
    return true;
}
int main(){
    return 0;
}