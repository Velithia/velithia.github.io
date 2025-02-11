---
title: 【Leetcode】猫和老鼠游戏系列 题解
date: 2025-02-10 23:27:58
tags: [leetcode, 题解, 代码]
---
# 猫和老鼠 I和II 题解
## 猫和老鼠 题解
猫和老鼠是LeetCode上的一道博弈论问题。话不多说直接上链接：https://leetcode.cn/problems/cat-and-mouse/description/

第一次写Markdown，有点不熟练，大家多多包涵~

### 题意解析
要做出这道题目，首先当然需要先看懂题目啦……

有童鞋反馈连题目都没看懂，那我来解释一下：
猫最初在2位置，鼠鼠最初在1位置，游戏规则是：
1. 鼠鼠先走，然后猫再走，轮流进行。
2. 每次移动可以跳到任意一个相邻的位置。
3. 如果鼠鼠到达0这个位置（安全屋），则鼠鼠获胜。
4. 如果猫到达鼠鼠的位置，则猫获胜。
5. 如果鼠鼠和猫一直移动都不能分出胜负，则认为是平局。
6. 输出结果为：1表示鼠鼠获胜；2表示猫获胜；0表示平局。

graph给的是与当前位置连通的位置，例如第一个样例graph = [[2,5],[3],[0,4,5],[1,4,5],[2,3],[0,2,3]]

意思是，与0连通的是2和5，与1连通的是3，以此类推……

建议配合样例1的图食用：
![样例1的图](/images/cat1.jpg)

### 解题思路
首先，我们定义dp数组，dp[m][c][t]表示鼠鼠在m，猫在c，轮到t（0-鼠，1-猫）时的结果。结果分为**鼠鼠赢、猫赢和平局**（具体值按照题目定义设置）。

也就是：

```cpp
const int MOUSE_WIN = 1, CAT_WIN = 2, DRAW = 0;
```

接下来考虑边界情况：如果鼠鼠到达0这个位置，则鼠鼠获胜；如果猫到达鼠鼠的位置，则猫获胜。把这两种位置的dp值分别设为**MOUSE_WIN**和**CAT_WIN**，还要把这两种获胜的状态加入队列中。

```cpp
// 初始化边界条件：鼠鼠直达安全屋，鼠赢
for (int c = 0; c < n; c++) {
    for (int t = 0; t < 2; t++) {
        if (dp[0][c][t] == DRAW) {
            dp[0][c][t] = MOUSE_WIN;
            q.emplace_back(0, c, t, MOUSE_WIN); // 加入队列
        }
    }
}
// 初始化边界条件：猫鼠相遇（猫不能进入安全屋），猫赢
for (int m = 1; m < n; m++) {
    for (int t = 0; t < 2; t++) {
        if (dp[m][m][t] == DRAW) {
            dp[m][m][t] = CAT_WIN;
            q.emplace_back(m, m, t, CAT_WIN);
        }
    }
}
```

加入队列中，就可以考虑进行BFS了。每次循环，我们从队列中取出一个状态，然后考虑其父状态。假设取出状态的轮次为t，则其父状态的轮次为1-t（或者t^1，结果一样）。

我们假设父状态是0（说明父状态是鼠鼠走的）。如果取出的状态是鼠鼠赢，那么父状态也应该是鼠鼠赢，因为鼠鼠必然可以通过这种走法躲进安全屋使得自己赢得游戏（鼠鼠既然能躲进安全屋为什么要跑去其它地方呢？）；

如果取出的状态是猫赢，那么当前结果不一定是猫赢，因为可能存在其它路径可以使鼠鼠逃脱猫的捕捉（但这条路径肯定不行！）。在这种情况下，我们只能将父状态中鼠鼠可以用来逃脱的路径数量减去1。如果这个值变成0了，就说明**无论怎么走，鼠鼠都逃不出猫的手掌心**，那么父状态就是猫赢。

队列中没有平局的状态，因此我们不需要考虑这种情况。

父状态是1的情况完全是对称的，这里不多说了。BFS完成后，dp[1][2][0]就是最终结果。

### 解决代码
时间复杂度O(N^3)，空间复杂度O(N^2)，证明略。
```cpp
class Solution {
public:
    int catMouseGame(vector<vector<int>>& graph) {
        int n = graph.size();
        const int MOUSE_WIN = 1, CAT_WIN = 2, DRAW = 0;
        // dp[m][c][t] 表示鼠鼠在m，猫在c，轮到t（0-鼠，1-猫）时的结果
        vector<vector<vector<int>>> dp(n, vector<vector<int>>(n, vector<int>(2, DRAW)));
        // degree[m][c][t] 表示该状态下可能的移动次数（度数）
        vector<vector<vector<int>>> degree(n, vector<vector<int>>(n, vector<int>(2, 0)));
        
        // 初始化度数
        for (int m = 0; m < n; m++) {
            for (int c = 0; c < n; c++) {
                // 鼠鼠的回合，可移动次数是邻接节点数
                degree[m][c][0] = graph[m].size();
                // 猫的回合，可移动次数是邻接节点中非0的数目
                int cnt = 0;
                for (int nei : graph[c]) {
                    if (nei != 0) cnt++;
                }
                degree[m][c][1] = cnt;
            }
        }
        
        deque<tuple<int, int, int, int>> q;
        // 初始化边界条件：鼠鼠直达安全屋，鼠赢
        for (int c = 0; c < n; c++) {
            for (int t = 0; t < 2; t++) {
                dp[0][c][t] = MOUSE_WIN;
                q.emplace_back(0, c, t, MOUSE_WIN);
            }
        }
        // 初始化边界条件：猫鼠相遇（猫不能进入安全屋），猫赢
        for (int m = 1; m < n; m++) { // 一定不要漏考虑！
            for (int t = 0; t < 2; t++) {
                dp[m][m][t] = CAT_WIN;
                q.emplace_back(m, m, t, CAT_WIN);
            }
        }
        
        while (!q.empty()) {
            auto [m, c, t, result] = q.front();
            q.pop_front();
            
            int prevTurn = 1 - t; // 父状态的轮次
            if (prevTurn == 0) { // 父状态是鼠鼠的回合（当前状态是猫移动后的结果）
                // 遍历所有可能的鼠鼠移动前的位置（prevMouse）
                for (int prevMouse : graph[m]) {
                    if (dp[prevMouse][c][0] != DRAW) continue; // 已处理过
                    // 如果当前结果鼠鼠赢，说明父状态的鼠鼠可以移动到这里赢，故父状态也赢
                    if (result == MOUSE_WIN) {
                        dp[prevMouse][c][0] = MOUSE_WIN;
                        q.emplace_back(prevMouse, c, 0, MOUSE_WIN);
                    } else {
                        // 当前结果对鼠鼠不利，父状态度数减一
                        degree[prevMouse][c][0]--;
                        if (degree[prevMouse][c][0] == 0) { // 所有移动都导致猫赢
                            dp[prevMouse][c][0] = CAT_WIN;
                            q.emplace_back(prevMouse, c, 0, CAT_WIN);
                        }
                    }
                }
            } else { // 父状态是猫的回合（当前状态是鼠鼠移动后的结果）
                // 遍历所有可能的猫移动前的位置（prevCat）
                for (int prevCat : graph[c]) {
                    if (prevCat == 0) continue; // 猫不能移动到0
                    if (dp[m][prevCat][1] != DRAW) continue; // 已处理过
                    // 如果当前结果猫赢，父状态的猫移动到这里赢
                    if (result == CAT_WIN) {
                        dp[m][prevCat][1] = CAT_WIN;
                        q.emplace_back(m, prevCat, 1, CAT_WIN);
                    } else {
                        // 当前结果对猫不利，父状态度数减一
                        degree[m][prevCat][1]--;
                        if (degree[m][prevCat][1] == 0) { // 所有移动都导致鼠鼠赢
                            dp[m][prevCat][1] = MOUSE_WIN;
                            q.emplace_back(m, prevCat, 1, MOUSE_WIN);
                        }
                    }
                }
            }
        }
        
        return dp[1][2][0]; // 初始状态：鼠鼠在1，猫在2，鼠鼠先手
    }
};
```

## 猫和老鼠 II 题解

和上题基本类似，只是老鼠和猫不一定只跳一格，且加了墙壁。把逆向走法处理好就没问题了：

```cpp
class Solution {
public:
    // 定义状态中走棋方
    static const int MOUSE_TURN = 0, CAT_TURN = 1;
    // 定义结果：0--未定/平局（在本题中平局算作猫胜），1--老鼠必胜，2--猫必胜
    static const int DRAW = 0, MOUSE_WIN = 1, CAT_WIN = 2;

    // 主函数
    bool canMouseWin(vector<string>& grid, int catJump, int mouseJump) {
        int n = grid.size(), m = grid[0].size();
        int total = n * m;
        // 用一维下标表示每个格子：位置 i 对应 (i/m, i%m)
        vector<bool> valid(total, false);         // 是否不为墙
        vector<char> cell(total, ' ');              // 存储每个格子字符
        int mouseStart = -1, catStart = -1, food = -1;
        for (int i = 0; i < n; i++){
            for (int j = 0; j < m; j++){
                int pos = i * m + j;
                cell[pos] = grid[i][j];
                if (grid[i][j] != '#') {
                    valid[pos] = true;
                }
                if (grid[i][j] == 'M') {
                    mouseStart = pos;
                } else if (grid[i][j] == 'C') {
                    catStart = pos;
                } else if (grid[i][j] == 'F') {
                    food = pos;
                }
            }
        }
        // 预处理：对于每个格子（非墙）计算“走法列表”
        // 注意：玩家可以在原地不动，也可以向上、下、左、右选择跳跃，跳跃不能穿过墙或出界。
        vector<vector<int>> movesMouse(total), movesCat(total);
        // 为方便构造反向边，我们在此处遍历所有格子（只对 valid 的格子计算走法）
        for (int pos = 0; pos < total; pos++) {
            if (!valid[pos]) continue;
            int r = pos / m, c = pos % m;
            // “原地不动”
            movesMouse[pos].push_back(pos);
            movesCat[pos].push_back(pos);
            // 四个方向
            vector<pair<int,int>> directions = { {-1,0}, {1,0}, {0,-1}, {0,1} };
            // 老鼠走法（距离上限为 mouseJump）
            for (auto &dir : directions) {
                for (int jump = 1; jump <= mouseJump; jump++){
                    int nr = r + dir.first * jump, nc = c + dir.second * jump;
                    if (nr < 0 || nr >= n || nc < 0 || nc >= m) break;  // 越界
                    int np = nr * m + nc;
                    if (grid[nr][nc] == '#') break;                     // 遇到墙就不能再往前跳
                    movesMouse[pos].push_back(np);
                }
            }
            // 猫走法（距离上限为 catJump）
            for (auto &dir : directions) {
                for (int jump = 1; jump <= catJump; jump++){
                    int nr = r + dir.first * jump, nc = c + dir.second * jump;
                    if (nr < 0 || nr >= n || nc < 0 || nc >= m) break;
                    int np = nr * m + nc;
                    if (grid[nr][nc] == '#') break;
                    movesCat[pos].push_back(np);
                }
            }
        }
        // 为“逆推”方便，根据上面的走法列表构造反向映射：
        // 对于老鼠：revMovesMouse[p] = 所有能够跳跃到 p 的起点（对 valid 的格子）
        // 对于猫：revMovesCat[p] = 所有能够跳跃到 p 的起点
        vector<vector<int>> revMovesMouse(total), revMovesCat(total);
        for (int pos = 0; pos < total; pos++){
            if (!valid[pos]) continue;
            for (int nxt : movesMouse[pos]) {
                revMovesMouse[nxt].push_back(pos);
            }
            for (int nxt : movesCat[pos]) {
                revMovesCat[nxt].push_back(pos);
            }
        }
        
        // dp[mouse][cat][turn]：状态 (mousePos, catPos, turn) 的结果，初始为 0 (未定/平局)
        // 同时维护每个状态的度数：当前走棋方有几种合法走法
        vector<vector<vector<int>>> color(total, vector<vector<int>>(total, vector<int>(2, DRAW)));
        vector<vector<vector<int>>> degree(total, vector<vector<int>>(total, vector<int>(2, 0)));

        // 计算度数：注意状态 (mouse, cat, turn) 只有当两个位置都是 valid 时才考虑
        for (int i = 0; i < total; i++) {
            if (!valid[i]) continue;
            for (int j = 0; j < total; j++) {
                if (!valid[j]) continue;
                // 当轮到老鼠走，下一步状态由老鼠的走法决定
                degree[i][j][MOUSE_TURN] = movesMouse[i].size();
                // 当轮到猫走，走法由猫的走法决定
                degree[i][j][CAT_TURN] = movesCat[j].size();
            }
        }
        
        // 初始化队列，将所有“终局状态”入队
        // 终局状态：
        // 1. 如果老鼠已经在食物处，则老鼠获胜
        // 2. 如果猫在食物处，则猫获胜（猫先到达食物）
        // 3. 如果猫与老鼠在同一位置，则猫获胜
        queue<tuple<int,int,int>> q;
        for (int i = 0; i < total; i++){
            if (!valid[i]) continue;
            for (int j = 0; j < total; j++){
                if (!valid[j]) continue;
                for (int turn = 0; turn < 2; turn++){
                    if (i == food) {
                        color[i][j][turn] = MOUSE_WIN;
                        q.emplace(i, j, turn);
                    } else if (j == food) {
                        // 如果猫到达食物，不论走棋顺序结果均为猫赢
                        color[i][j][turn] = CAT_WIN;
                        q.emplace(i, j, turn);
                    } else if (i == j) {
                        // 猫与老鼠重合，猫赢
                        color[i][j][turn] = CAT_WIN;
                        q.emplace(i, j, turn);
                    }
                }
            }
        }
        
        // 反向拓扑排序（逆向动态规划）：不断从定局状态反推出可以转移到这些状态的上一步状态
        while (!q.empty()) {
            auto [mousePos, catPos, turn] = q.front();
            q.pop();
            int outcome = color[mousePos][catPos][turn];
            // 上一步走棋方，与当前状态走棋方相反
            int prevTurn = (turn == MOUSE_TURN ? CAT_TURN : MOUSE_TURN);
            // 根据当前状态，求上一步可能达到此局面的所有状态
            if (turn == MOUSE_TURN) {
                // 当前状态是老鼠走，因此上一步的走法是猫走：
                // 上一步状态形如 (mousePos, prevCat, CAT_TURN) 且要求：prevCat 的走法中能跳到 catPos
                for (int prevCat : revMovesCat[catPos]) {
                    // 前驱状态的 mousePos 保持不变
                    if (!valid[mousePos] || !valid[prevCat]) continue;
                    if (color[mousePos][prevCat][prevTurn] != DRAW) continue;
                    // 如果上一状态（猫走）的玩家就是猫，本状态若结果为猫赢，
                    // 则猫可以直接选这一步达到必胜状态
                    if (prevTurn == CAT_TURN && outcome == CAT_WIN) {
                        color[mousePos][prevCat][prevTurn] = CAT_WIN;
                        q.emplace(mousePos, prevCat, prevTurn);
                    } else {
                        // 否则，对应状态的出度减1
                        degree[mousePos][prevCat][prevTurn]--;
                        // 如果当前状态的所有走法都不能帮助该玩家取胜，
                        // 则该状态必定对当前走棋方不利，
                        // 即对于猫走状态，若所有走法都不能获得猫必胜，则上一状态结果为老鼠胜
                        if (degree[mousePos][prevCat][prevTurn] == 0) {
                            color[mousePos][prevCat][prevTurn] = (prevTurn == CAT_TURN ? MOUSE_WIN : CAT_WIN);
                            q.emplace(mousePos, prevCat, prevTurn);
                        }
                    }
                }
            } else {  // turn == CAT_TURN
                // 当前状态由猫走，因此上一步走棋方为老鼠，上一步状态形如 (prevMouse, catPos, MOUSE_TURN)
                // 并要求：prevMouse 的走法中能跳到 mousePos
                for (int prevMouse : revMovesMouse[mousePos]) {
                    if (!valid[prevMouse] || !valid[catPos]) continue;
                    if (color[prevMouse][catPos][prevTurn] != DRAW) continue;
                    if (prevTurn == MOUSE_TURN && outcome == MOUSE_WIN) {
                        color[prevMouse][catPos][prevTurn] = MOUSE_WIN;
                        q.emplace(prevMouse, catPos, prevTurn);
                    } else {
                        degree[prevMouse][catPos][prevTurn]--;
                        if (degree[prevMouse][catPos][prevTurn] == 0) {
                            color[prevMouse][catPos][prevTurn] = (prevTurn == MOUSE_TURN ? CAT_WIN : MOUSE_WIN);
                            q.emplace(prevMouse, catPos, prevTurn);
                        }
                    }
                }
            }
        }
        
        // 最后初始状态为 (mouseStart, catStart, MOUSE_TURN)
        // 注意：若经过传播后该状态仍未定，则属于循环（平局）情况——根据题意猫获胜
        return color[mouseStart][catStart][MOUSE_TURN] == MOUSE_WIN;
    }
};
```